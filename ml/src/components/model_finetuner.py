from transformers import AutoTokenizer, AutoModelForSequenceClassification, TrainingArguments, Trainer
from sklearn.metrics import precision_recall_fscore_support
from src.exception import CustomExeception
from src.logger import logging
import evaluate
import numpy as np
import os
import sys
from dataclasses import dataclass

@dataclass
class ModelFinetunerConfig:
    model_obj_path: str = os.path.join('artifacts', 'model.pkl')

class ModelFinetuner:
    def __init__(self):
        self.model_tuner_config = ModelFinetunerConfig()
    
    def FineTuning(self, labels, tokenized_dataset, preprocessor_path):
        try:
            tokenizer = AutoTokenizer.from_pretrained(preprocessor_path)
            logging.info("imported the tokenizer model")
            model = AutoModelForSequenceClassification.from_pretrained(
                "yikuan8/Clinical-BigBird",
                num_labels=len(labels),
                use_safetensors=True
            )
            logging.info("model imported")
            model.config.id2label = {i: label for i, label in enumerate(labels)}
            model.config.label2id = {label: i for i, label in enumerate(labels)}

            metric = evaluate.load("accuracy")
            def compute_metrics(eval_pred):
                logits, labels = eval_pred
                predictions = np.argmax(logits, axis=-1)
                precision, _, f1, _ = precision_recall_fscore_support(labels, predictions, average='weighted')

                return {
                    'accuracy': metric.compute(predictions=predictions, references=labels),
                    'f1': f1,
                    'precision': precision,
                }

            training_args = TrainingArguments(
                output_dir="./clinical_bigbird_symptom_classifier_4096",
                learning_rate=2e-5,
                per_device_train_batch_size=8,
                per_device_eval_batch_size=8,
                gradient_accumulation_steps=16,
                num_train_epochs=3,
                weight_decay=0.01,
                optim="adamw_torch",
                eval_strategy="epoch",
                save_strategy="epoch",
                load_best_model_at_end=True,
            )
            logging.info("Training arguments created")

            trainer = Trainer(
                model=model,
                args=training_args,
                train_dataset=tokenized_dataset["train"],
                eval_dataset=tokenized_dataset["test"],
                tokenizer=tokenizer,
                compute_metrics=compute_metrics,
            )
            logging.info("Trainer model made and finetuning started")
            trainer.train()
            logging.info("Finetuning finished")
            model.save_pretrained(self.model_tuner_config.model_obj_path)
            logging.info("Funetuned model saved")

            return(
                self.model_tuner_config.model_obj_path
            )
        except Exception as e:
            raise CustomExeception(e, sys)
