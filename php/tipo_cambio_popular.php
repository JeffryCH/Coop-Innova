<?php
header('Content-Type: application/json');

// Obtener tipo de cambio del Banco Popular desde BCCR
$url = 'https://gee.bccr.fi.cr/IndicadoresEconomicos/Cuadros/frmConsultaTCVentanilla.aspx';

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
$html = curl_exec($ch);
curl_close($ch);

if (!$html) {
    echo json_encode(['success' => false, 'error' => 'No se pudo obtener la página del Banco Popular']);
    exit;
}

// Buscar los valores de compra y venta en el HTML



$compra = null;
$venta = null;
$banco_popular = 'Banco Popular y de Desarrollo Comunal';
libxml_use_internal_errors(true);
$dom = new DOMDocument();
$dom->loadHTML($html);
$xpath = new DOMXPath($dom);
// Buscar la tabla con id 'DG'
$tabla = $xpath->query("//table[@id='DG']");
if ($tabla->length > 0) {
    $filas = $tabla->item(0)->getElementsByTagName('tr');
    foreach ($filas as $fila) {
        $celdas = $fila->getElementsByTagName('td');
        if ($celdas->length >= 4) {
            $banco = trim($celdas->item(1)->textContent);
            if (stripos($banco, $banco_popular) !== false) {
                $compra = floatval(str_replace(',', '', $celdas->item(2)->textContent)) / 100;
                $venta = floatval(str_replace(',', '', $celdas->item(3)->textContent)) / 100;
                break;
            }
        }
    }
}
libxml_clear_errors();

if ($compra && $venta) {
    echo json_encode([
        'success' => true,
        'data' => [
            'compra' => $compra,
            'venta' => $venta,
            'banco' => 'Banco Popular y de Desarrollo Comunal',
            'fecha' => date('Y-m-d H:i:s')
        ]
    ]);
} else {
    echo json_encode(['success' => false, 'error' => 'No se pudo extraer el tipo de cambio']);
}
?>