'''
Business: API для управления товарами (букетами) - CRUD операции
Args: event - dict с httpMethod, body, pathParams, queryStringParameters
      context - object с атрибутами request_id, function_name и т.д.
Returns: HTTP response dict с товарами или результатом операции
'''

import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from typing import Dict, Any, Optional
from datetime import datetime

def json_serial(obj):
    if isinstance(obj, datetime):
        return obj.isoformat()
    raise TypeError(f"Type {type(obj)} not serializable")

def get_db_connection():
    database_url = os.environ.get('DATABASE_URL')
    return psycopg2.connect(database_url, cursor_factory=RealDictCursor)

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
    }
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        if method == 'GET':
            path_params = event.get('pathParams', {})
            product_id = path_params.get('id')
            
            if product_id:
                cursor.execute('SELECT * FROM products WHERE id = %s', (product_id,))
                product = cursor.fetchone()
                
                if not product:
                    return {
                        'statusCode': 404,
                        'headers': headers,
                        'body': json.dumps({'error': 'Product not found'}),
                        'isBase64Encoded': False
                    }
                
                return {
                    'statusCode': 200,
                    'headers': headers,
                    'body': json.dumps(dict(product), default=json_serial),
                    'isBase64Encoded': False
                }
            else:
                cursor.execute('SELECT * FROM products ORDER BY id')
                products = cursor.fetchall()
                
                return {
                    'statusCode': 200,
                    'headers': headers,
                    'body': json.dumps([dict(p) for p in products], default=json_serial),
                    'isBase64Encoded': False
                }
        
        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            
            name = body_data.get('name')
            price = body_data.get('price')
            category = body_data.get('category')
            description = body_data.get('description', '')
            image_url = body_data.get('image_url', '')
            
            if not name or not price or not category:
                return {
                    'statusCode': 400,
                    'headers': headers,
                    'body': json.dumps({'error': 'Name, price and category are required'}),
                    'isBase64Encoded': False
                }
            
            cursor.execute(
                '''INSERT INTO products (name, price, category, description, image_url) 
                   VALUES (%s, %s, %s, %s, %s) RETURNING *''',
                (name, price, category, description, image_url)
            )
            conn.commit()
            
            new_product = cursor.fetchone()
            
            return {
                'statusCode': 201,
                'headers': headers,
                'body': json.dumps(dict(new_product), default=json_serial),
                'isBase64Encoded': False
            }
        
        elif method == 'PUT':
            path_params = event.get('pathParams', {})
            product_id = path_params.get('id')
            
            if not product_id:
                return {
                    'statusCode': 400,
                    'headers': headers,
                    'body': json.dumps({'error': 'Product ID is required'}),
                    'isBase64Encoded': False
                }
            
            body_data = json.loads(event.get('body', '{}'))
            
            name = body_data.get('name')
            price = body_data.get('price')
            category = body_data.get('category')
            description = body_data.get('description')
            image_url = body_data.get('image_url')
            
            cursor.execute(
                '''UPDATE products 
                   SET name = %s, price = %s, category = %s, description = %s, image_url = %s, updated_at = CURRENT_TIMESTAMP
                   WHERE id = %s RETURNING *''',
                (name, price, category, description, image_url, product_id)
            )
            conn.commit()
            
            updated_product = cursor.fetchone()
            
            if not updated_product:
                return {
                    'statusCode': 404,
                    'headers': headers,
                    'body': json.dumps({'error': 'Product not found'}),
                    'isBase64Encoded': False
                }
            
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps(dict(updated_product), default=json_serial),
                'isBase64Encoded': False
            }
        
        elif method == 'DELETE':
            path_params = event.get('pathParams', {})
            product_id = path_params.get('id')
            
            if not product_id:
                return {
                    'statusCode': 400,
                    'headers': headers,
                    'body': json.dumps({'error': 'Product ID is required'}),
                    'isBase64Encoded': False
                }
            
            cursor.execute('DELETE FROM products WHERE id = %s RETURNING id', (product_id,))
            conn.commit()
            
            deleted = cursor.fetchone()
            
            if not deleted:
                return {
                    'statusCode': 404,
                    'headers': headers,
                    'body': json.dumps({'error': 'Product not found'}),
                    'isBase64Encoded': False
                }
            
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({'message': 'Product deleted successfully'}),
                'isBase64Encoded': False
            }
        
        else:
            return {
                'statusCode': 405,
                'headers': headers,
                'body': json.dumps({'error': 'Method not allowed'}),
                'isBase64Encoded': False
            }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }
    
    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'conn' in locals():
            conn.close()