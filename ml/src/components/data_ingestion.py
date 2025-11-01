import os
import sys
from src.exception import CustomExeception
from src.logger import logging
from dataclasses import dataclass
import pandas as pd
from src.components.data_transformation import DataTranformation
from src.components.model_finetuner import ModelFinetuner

@dataclass
class DataIngestionConfig:
    raw_data_path: str = os.path.join('artifacts', 'raw.csv')

class DataIngestion:
    def __init__(self):
        self.dataingestionconfig = DataIngestionConfig()
    
    def initiate_funetuning_data_ingestion(self, finetune_data_path):
        logging.info("Data Ingestion started")
        try:
            df = pd.read_excel(finetune_data_path)
            logging.info('Read the raw data')

            os.makedirs(os.path.dirname(self.dataingestionconfig.raw_data_path), exist_ok=True)

            df.to_csv(self.dataingestionconfig.raw_data_path, index=False, header=True)
            logging.info("Raw data saved")

            return(
                self.dataingestionconfig.raw_data_path
            )
        except Exception as e:
            raise CustomExeception(e, sys)


    def prediction_data_ingestion(self, data: dict):
        try:
            food = (
                data.get('foodday1', '') + 
                data.get('foodday2', '') + 
                data.get('foodday3', '') + 
                data.get('foodday4', '') + 
                data.get('foodday5', '')
            )

            new_row = {
                'food': food,
                'age': data.get('age'),
                'gender': data.get('gender'),
                'occupation': data.get('occupation'),
                'travel_history': data.get('travel_history'),
                'symptoms': data.get('symptoms')
            }

            return new_row
        except Exception as e:
            raise CustomExeception(e, sys)