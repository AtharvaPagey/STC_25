from transformers import AutoTokenizer, AutoModelForSequenceClassification
import pandas as pd
import numpy as np
import sys
import torch
from src.exception import CustomExeception
from src.logger import logging
from src.components.data_ingestion import prediction_data_ingestion
from src.components.data_transformation import prediction_data_transformation, DataTransformationConfig
from src.components.model_finetuner import ModelFinetunerConfig
from dataclasses import dataclass

class Model_Prediction:
    def __init__(self):
        pass

    def model_data_prediction(self, raw_data):
        try:
            model = AutoModelForSequenceClassification.from_pretrained(ModelFinetunerConfig().model_obj_path)
            logging.info("called the model")
            tokenizer = AutoTokenizer.from_pretrained(DataTransformationConfig().preprocessor_obj_file_path)
            logging.info("called the tokenizer")

            data = prediction_data_ingestion(raw_data)
            text = prediction_data_transformation(data)

            device = "cuda" if torch.cuda.is_available() else "cpu"
            model.to(device)
            inputs = tokenizer(text, return_tensors="pt").to(device)

            with torch.no_grad():
                outputs = model(**inputs)
                logits = outputs.logits
                pred_class_id = torch.argmax(logits, dim = -1).item()
                predicted_label = model.config.id2label[pred_class_id]
            
            return (predicted_label)

        except Exception as e:
            raise CustomExeception(e, sys)