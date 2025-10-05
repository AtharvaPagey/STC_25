import pandas as pd
import numpy as np
from src.exception import CustomExeception
from src.logger import logging
import os
import sys
from dataclasses import dataclass
import re
from thefuzz import process, fuzz
from datasets import load_dataset, Features, ClassLabel, Value, Dataset
import evaluate
from transformers import AutoTokenizer

@dataclass
class DataTransformationConfig:
    preprocessor_obj_file_path = os.path.join('artifects', 'preprocessor.pkl')

class DataTranformation:

    def __init__(self):
        self.data_transformation_config = DataTransformationConfig()
    
    def clean_and_deduplicate_foods(log_string):
        if isinstance(log_string, float) and np.isnan(log_string):
            log_string = ""

        cleaned_string = re.sub(r"Day 1:", "", log_string)
        cleaned_string = re.sub(r"; Day \d+:", ",", cleaned_string)
        cleaned_string = re.sub(r"\.", "", cleaned_string)

        food_items = [item.strip() for item in cleaned_string.split(',')]

        unique_items = list(dict.fromkeys(item for item in food_items if item))

        final_string = ", ".join(unique_items)
        return f", Food Eaten in Last 5 Days {final_string}"