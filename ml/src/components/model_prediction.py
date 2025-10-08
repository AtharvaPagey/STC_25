from transformers import AutoTokenizer, AutoModelForSequenceClassification
import pandas as pd
import numpy as np
import sys
import os
from src.exception import CustomExeception
from src.logger import logging
from src.components.data_ingestion import prediction_data_ingestion
from src.components.data_transformation import prediction_data_transformation, DataTransformationConfig
from src.components.model_finetuner import ModelFinetunerConfig
from dataclasses import dataclass

class Model_Prediction:
    def __init__(self):
        pass

    def model_data_prediction(self):
        try:
            model = AutoModelForSequenceClassification.from_pretrained(ModelFinetunerConfig().model_obj_path)
            logging.info("called the model")
            tokenizer = AutoTokenizer.from_pretrained(DataTransformationConfig().preprocessor_obj_file_path)
            logging.info("called the tokenizer")


        except Exception as e:
            raise CustomExeception(e, sys)