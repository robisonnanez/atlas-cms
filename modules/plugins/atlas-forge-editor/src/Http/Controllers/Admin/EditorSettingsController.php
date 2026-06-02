<?php

namespace Modules\Plugins\AtlasForgeEditor\Http\Controllers\Admin;

use Illuminate\Routing\Controller;
use Modules\Plugins\AtlasForgeEditor\Support\AtlasForgeEditor;

class EditorSettingsController extends Controller
{
    public function __invoke(AtlasForgeEditor $editor)
    {
        return view('atlas-forge-editor::admin.settings', [
            'editor' => $editor->definition(),
        ]);
    }
}
