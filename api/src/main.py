from fastapi import FastAPI, UploadFile, File
from pathlib import Path
from datetime import datetime
import pandas as pd
import camelot
import uvicorn

app = FastAPI()
tempDir = '/workspace/financi/api/temp'

@app.get("/")
async def root():
    return {"message": "Hello World"}

# if __name__=="__main__":
#     uvicorn.run(app, port=43691, host=)

@app.post("/add-pdf")
async def add_pdf(file: UploadFile = File(...)):
    
    # filePath = tempDir.joinpath(f"{str(datetime.now().timestamp())}.pdf")
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
    return table_df.to_dict()
