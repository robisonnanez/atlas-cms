<?php

namespace App\Console\Commands;

use App\Models\ScheduledTask;
use Illuminate\Console\Command;

class RunScheduledTasksCommand extends Command
{
    protected $signature = 'atlas:run-scheduled-tasks {--task= : ID de la tarea específica a ejecutar}';

    protected $description = 'Ejecuta las tareas programadas registradas en la base de datos de Atlas CMS';

    public function handle(): int
    {
        $taskId = $this->option('task');

        if ($taskId) {
            $task = ScheduledTask::query()->find($taskId);
            if (! $task) {
                $this->error("No se encontró la tarea con ID: {$taskId}");

                return Command::FAILURE;
            }

            $this->info("Ejecutando tarea: {$task->name} ({$task->command})...");
            $run = $task->execute();
            $this->info("Finalizado con estado: {$run->status} en {$run->duration_ms}ms");

            return $run->status === 'success' ? Command::SUCCESS : Command::FAILURE;
        }

        $tasks = ScheduledTask::query()->active()->get();
        if ($tasks->isEmpty()) {
            $this->info('No hay tareas programadas activas para ejecutar.');

            return Command::SUCCESS;
        }

        $this->info("Ejecutando {$tasks->count()} tarea(s) programada(s)...");

        $failed = 0;
        foreach ($tasks as $task) {
            $this->line("-> {$task->name} [{$task->command}]");
            $run = $task->execute();
            if ($run->status !== 'success') {
                $failed++;
                $this->warn("   Falló: {$run->output}");
            } else {
                $this->info("   Éxito ({$run->duration_ms}ms)");
            }
        }

        $this->info("Ejecución finalizada. {$failed} tarea(s) fallaron.");

        return $failed === 0 ? Command::SUCCESS : Command::FAILURE;
    }
}
