import pandas as pd
from src.exception import CustomExeception
from src.logger import logging
import os
import sys
from dataclasses import dataclass
from datasets import Features, ClassLabel, Value, Dataset
from transformers import AutoTokenizer

@dataclass
class DataTransformationConfig:
    preprocessor_obj_file_path: str = os.path.join('artifects', 'preprocessor.pkl')

class DataTranformation:
    def __init__(self):
        self.data_transformation_config = DataTransformationConfig()
    
    def funetuning_datatransformer(self, data_path):
        try:
            def tokenize_function(examples):
                try:
                    return tokenizer(examples["text"], truncation=True, padding="max_length", max_length=4096)
                except Exception as e:
                    raise CustomExeception(e, sys)
            
            df = pd.read_csv(data_path)
            logging.info("Dataset loaded")

            tokenizer = AutoTokenizer.from_pretrained("yikuan8/Clinical-BigBird")

            if 'Unnamed: 0' in df.columns:
                df = df.drop(columns=['Unnamed: 0'])

            dataset = Dataset.from_pandas(df, features)
            dataset = dataset.train_test_split(test_size=0.2)
            logging.info("train test split done")

            label_names = df['label'].unique().tolist()

            features = Features({
                'text': Value('string'),
                'labels': ClassLabel(names=label_names)
            })

            tokenized_data = dataset.map(tokenize_function, batched=True)
            logging.info("Data tokenized")

            tokenizer.save_pretrained(self.data_transformation_config.preprocessor_obj_file_path)
            logging.info("Preprocessor model saved")

            return(
                label_names,
                tokenized_data,
                self.data_transformation_config.preprocessor_obj_file_path
            )
        except Exception as e:
            raise CustomExeception(e, sys)
    
    def prediction_data_transformation(self):
        try:
            pass
        except Exception as e:
            raise CustomExeception(e, sys)