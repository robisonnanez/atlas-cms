<?php

return [
    'enabled' => true,
    'default_height' => 560,
    'sticky_toolbar' => true,
    'allow_html_mode' => true,
    'allow_tables' => true,
    'allow_media' => true,
    'sanitize_on_save' => true,
    'allowed_tags' => [
        'p','br','strong','b','em','i','u','s','blockquote','pre','code','h1','h2','h3','h4','h5','h6',
        'ul','ol','li','a','img','figure','figcaption','table','thead','tbody','tfoot','tr','th','td','span','div',
        'hr','sup','sub','mark','details','summary'
    ],
    'allowed_attributes' => ['href','target','rel','src','alt','title','width','height','class','style','colspan','rowspan'],
];
