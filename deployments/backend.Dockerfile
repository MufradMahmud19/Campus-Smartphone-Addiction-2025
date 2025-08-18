FROM python:3.11-alpine

RUN apk add --no-cache build-base

WORKDIR /code

COPY backend/requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY backend /code

EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
