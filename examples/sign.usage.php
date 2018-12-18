<?php
$query = array(
    'url' => 'https://source.unsplash.com/featured/500x500',
    'resize' => array(
        'width' => 200,
        'height' => 150,
        'withoutEnlargement' => 'true',
        // 'fit' => 'cover',
        // 'position' => 'right bottom',
    ),
    'output' => array(
        'quality' => 6,
        'format' => 'jpeg',
    ),
);

$qs = http_build_query($query);

$options = array(
    'http' => array(
        'method' => "GET",
        'header' =>
            "x-nail-sign-token: lessSecret\r\n" .
        //  "x-nail-send: redirect\r\n" .
            "x-nail-send: url\r\n",
    ),
);

$url = 'http://localhost:8989/sign';
$context = stream_context_create($options);
$file = file_get_contents($url.'?'.$qs, false, $context);

echo $file."\n";
