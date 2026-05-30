<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

class Media extends Model
{
    use LogsActivity;

    protected $fillable = [
        'directory_id',
        'disk',
        'path',
        'filename',
        'mime_type',
        'extension',
        'size',
        'alt_text',
        'title',
        'metadata',
        'uploaded_by',
    ];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->useLogName('media')
            ->logOnly(['directory_id', 'disk', 'path', 'filename', 'mime_type', 'extension', 'size', 'alt_text', 'title', 'uploaded_by'])
            ->logOnlyDirty();
    }

    protected function casts(): array
    {
        return [
            'metadata' => 'array',
        ];
    }

    public function directory(): BelongsTo
    {
        return $this->belongsTo(MediaDirectory::class, 'directory_id');
    }

    public function uploader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }
}
