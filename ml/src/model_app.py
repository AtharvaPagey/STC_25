from flask import Flask, request, jsonify
import threading
import uuid
import os
import pandas as pd
from datasets import Dataset
from transformers import AutoTokenizer
from src.logger import logging
from src.components.model_prediction import Model_Prediction
from src.components.data_transformation import DataTransformationConfig
from src.components.model_finetuner import ModelFinetuner, ModelFinetunerConfig


app = Flask(__name__)
jobs = {}

UPLOAD_FOLDER = './uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs('artifacts', exist_ok=True)

SAVED_MODEL_PATH = ModelFinetunerConfig().model_obj_path
TOKENIZER_PATH = DataTransformationConfig().preprocessor_obj_file_path
BASE_MODEL_NAME = "yikuan8/Clinical-BigBird"


prediction_pipeline = Model_Prediction()

@app.route('/predict', methods=['POST'])
def handle_prediction():
    try:
        raw_data = request.get_json()
        if not raw_data:
            return jsonify({"error": "No field provided in JSON"}), 400
        
        predicted_label = prediction_pipeline.model_data_prediction(raw_data)
        
        return predicted_label

    except Exception as e:
        logging.error(f"Error in /predict endpoint: {e}", exc_info=True)
        return jsonify({"error": f"An unexpected error occurred: {str(e)}"}), 500


def run_finetuning_task(job_id, filepath, labels_list):
    logging.info(f"[Job {job_id}] Starting fine-tuning with file {filepath}.")
    jobs[job_id] = 'running'
    
    try:
        logging.info(f"[Job {job_id}] Loading base tokenizer {BASE_MODEL_NAME}...")
        tokenizer = AutoTokenizer.from_pretrained(TOKENIZER_PATH)

        logging.info(f"[Job {job_id}] Loading XLSX and converting to Dataset...")
        df = pd.read_excel(filepath)
        
        if 'label' not in df.columns or 'text' not in df.columns:
            raise ValueError("CSV must contain 'text' and 'label' columns")
        
        label_map = {name: i for i, name in enumerate(labels_list)}
        df['label'] = df['label'].map(label_map)
        
        if df['label'].isnull().any():
            raise ValueError("One or more 'label' values in the CSV were not found in the provided labels list.")

        hf_dataset = Dataset.from_pandas(df)

        logging.info(f"[Job {job_id}] Tokenizing dataset...")
        def tokenize_function(examples):
            return tokenizer(examples["text"], padding="max_length", truncation=True, max_length=4096)
        tokenized_dataset = hf_dataset.map(tokenize_function, batched=True)
        
        tokenized_dataset_split = tokenized_dataset.train_test_split(test_size=0.2, seed=42)

        logging.info(f"[Job {job_id}] Handing off to ModelFinetuner class...")
        finetuner = ModelFinetuner()
        
        finetuner.FineTuning(
            labels=labels_list,
            tokenized_dataset=tokenized_dataset_split,
            preprocessor_path=TOKENIZER_PATH
        )
        
        jobs[job_id] = 'completed'
        logging.info(f"[Job {job_id}] Fine-tuning completed successfully.")
        
        os.remove(filepath)

    except Exception as e:
        jobs[job_id] = 'failed'
        logging.error(f"[Job {job_id}] Fine-tuning failed: {e}", exc_info=True)


@app.route('/finetune', methods=['POST'])
def start_finetuning():
    try:
        if 'file' not in request.files:
            return jsonify({"error": "No 'file' part in request"}), 400
        file = request.files['file']
        if file.filename == '':
            return jsonify({"error": "No selected file"}), 400
        
        allowed_extensions = {'.xlsx'}
        file_ext = os.path.splitext(file.filename)[1]
        if file_ext.lower() not in allowed_extensions:
            return jsonify({"error": "Invalid file type. Please upload a .xlsx file."}), 400

        if 'labels' not in request.form:
            return jsonify({"error": "No 'labels' field in form data"}), 400
        
        labels_str = request.form['labels']
        labels_list = [label.strip() for label in labels_str.split(',')]
        if not labels_list:
            return jsonify({"error": "'labels' field cannot be empty"}), 400
            
        job_id = str(uuid.uuid4())
        filename = f"{job_id}_{file.filename}"
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        file.save(filepath)
        
        thread = threading.Thread(target=run_finetuning_task, args=(job_id, filepath, labels_list))
        thread.daemon = True 
        thread.start()
        
        logging.info(f"Accepted new fine-tuning job: {job_id}")
        
        return jsonify({
            "message": "Fine-tuning job accepted.",
            "jobId": job_id,
            "statusUrl": f"/finetune/status/{job_id}"
        }), 202

    except Exception as e:
        logging.error(f"Error in /finetune endpoint: {e}", exc_info=True)
        return jsonify({"error": f"An unexpected error occurred: {str(e)}"}), 500


@app.route('/finetune/status/<job_id>', methods=['GET'])
def get_job_status(job_id):
    status = jobs.get(job_id, 'not_found')
    if status == 'completed':
        response = {"status": "OK. Fine-tuning is done."}
    else:
        response = {"jobId": job_id, "status": status}
        
    return jsonify(response)


if __name__ == '__main__':
    print("app is running")
    # always run like this in cmd
    # python -m src.finetune_app
    logging.info("the app stsrted running")
    app.run(host='0.0.0.0', port=5001, debug=True)

