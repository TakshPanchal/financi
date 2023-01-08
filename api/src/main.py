from fastapi import FastAPI, UploadFile, File
from xgboost import XGBRegressor
import io
from pathlib import Path
from datetime import datetime
import pandas as pd
import camelot
import uvicorn
import os
from dateutil import parser

from fastapi.responses import JSONResponse, StreamingResponse


app = FastAPI()

tempDir = '/workspace/financi/api/temp'
models = '/workspace/financi/api/models'

if not os.path.exists(tempDir):
        os.makedirs(tempDir)

if not os.path.exists(models):
        os.makedirs(models)
        
@app.get("/")
async def root():
    return {"message": "Hello World"}

@app.post("/add-pdf")
async def add_pdf(file: UploadFile = File(...)):
    filePath = f"{tempDir}/{str(datetime.now().timestamp())}.pdf"
    with open(filePath, "wb+") as file_object:
        file_object.write(file.file.read())
    
    tables = camelot.read_pdf(filePath, pages='all') 

    table_df = None
    for tab in tables:
        df = tab.df.copy()
        df.rename(df.iloc[0], axis=1, inplace=True)
        df.drop(0, axis='index', inplace=True)
        table_df = pd.concat([table_df, df], axis=0)
    del df

    # Replace \n to space
    table_df.columns = [c.replace("\n", " ") for c in table_df.columns]
    table_df = table_df.replace(r'\n', ' ', regex=True)

    # Value Date -> Description
    date_regex = date_regex = r"\b(0?[1-9]|[12][0-9]|3[01])\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{4})\b(.*)"

    temp_df = table_df['Value Date'].str.extract(date_regex, expand=True)
    temp_df['date'] = temp_df[0].str.cat([temp_df[1], temp_df[2]], sep=' ')
    table_df["Value Date"] = temp_df['date']
    table_df['Description'] = temp_df[3].str.cat(table_df['Description'], sep=' ')
    del temp_df

    table_df['Txn Date'] = pd.to_datetime(table_df['Txn Date'], infer_datetime_format=True)
    table_df['Value Date'] = pd.to_datetime(table_df['Value Date'], infer_datetime_format=True)

    table_df[['Debit', 'Credit', 'Balance']] = table_df[['Debit', 'Credit', 'Balance']].replace(',','', regex=True)
    table_df['Debit'] = pd.to_numeric(table_df['Debit'])
    table_df['Credit'] = pd.to_numeric(table_df['Credit'])
    table_df['Balance'] = pd.to_numeric(table_df['Balance'])
    table_df = table_df.fillna(0)

    table_df['Value Date'] = table_df['Value Date'].astype(str)
    table_df['Txn Date'] = table_df['Txn Date'].astype(str)
    print(len(table_df))
   
    stream = io.StringIO()
    table_df.to_csv(stream, index = False)
    response = StreamingResponse(iter([stream.getvalue()]),
                            media_type="text/csv")
    print(len(table_df))
    response.headers['Access-Control-Allow-Origin'] = "*"
    response.headers['Access-Control-Allow-Headers'] = "Origin, X-Requested-With, Content-Type, Accept"

    # headers = {
    #     "Access-Control-Allow-Origin" : "*",
    #     "Access-Control-Allow-Headers" : "Origin, X-Requested-With, Content-Type, Accept"
    # }
    return response

@app.get("/forecast")
async def forecast(uid, time):
    model_path = f"{models}/popu.json"
    model = XGBRegressor()
    date = parser.parse(time)
    if os.path.exists(model_path):
        print("sdasdasd")
        model.load_model(model_path)
        prediction = model.predict([[date.year, date.month, int(date.strftime("%V")), date.weekday() + 1, date.day]])
        print("Pred" , prediction)
        print("sdasdasd")

        return {'prediction' : str(prediction[0])}
    
    return {"uid": str(uid)}


if __name__ == "__main__":
    uvicorn.run(app, port=8080, reload=True)