# api_tipo_cambio_popular.py

from flask import Flask, jsonify
import requests
from bs4 import BeautifulSoup
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

URL = "https://gee.bccr.fi.cr/IndicadoresEconomicos/Cuadros/frmConsultaTCVentanilla.aspx"
BANCO_POPULAR = "Banco Popular y de Desarrollo Comunal"

@app.route('/api/tipo-cambio-popular', methods=['GET'])
def tipo_cambio_popular():
    try:
        resp = requests.get(URL, timeout=10)
        resp.raise_for_status()
        soup = BeautifulSoup(resp.text, "html.parser")
        tabla = soup.find("table", {"id": "DG"})
        if not tabla:
            return jsonify({"error": "No se encontró la tabla de datos en la página fuente."}), 500

        for fila in tabla.find_all("tr"):
            celdas = fila.find_all("td")
            if len(celdas) >= 4 and BANCO_POPULAR.lower() in celdas[1].get_text(strip=True).lower():
                compra = celdas[2].get_text(strip=True).replace(",", "")
                venta = celdas[3].get_text(strip=True).replace(",", "")
                try:
                    # Corrige el formato dividiendo por 100 y redondeando a 2 decimales
                    compra_val = round(float(compra) / 100, 2)
                    venta_val = round(float(venta) / 100, 2)
                    return jsonify({
                        "compra": compra_val,
                        "venta": venta_val
                    })
                except ValueError:
                    return jsonify({"error": "No se pudo convertir los valores de compra/venta a número."}), 500

        return jsonify({"error": "No se encontró el Banco Popular y de Desarrollo Comunal en la tabla."}), 404

    except Exception as e:
        return jsonify({"error": f"Error al obtener el tipo de cambio: {str(e)}"}), 500

if __name__ == "__main__":
    app.run(debug=True, port=5000)

"""
=========================
INSTRUCCIONES PARA USO LOCAL
=========================

1. Instala las dependencias necesarias:
   pip install flask requests beautifulsoup4 flask-cors

2. Ejecuta el backend:
   python api_tipo_cambio_popular.py

3. Accede a la API en tu navegador o con curl:
   http://localhost:5000/api/tipo-cambio-popular

La respuesta será un JSON como:
{
  "compra": 520.0,
  "venta": 530.0
}

Si ocurre un error de scraping, se devuelve un mensaje claro en el JSON.
"""