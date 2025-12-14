<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        User::factory()->create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'role' => 'admin',
        ]);

        User::factory()->create([
            'name' => 'Petugas User',
            'email' => 'petugas@example.com',
            'role' => 'petugas',
        ]);

        User::factory()->create([
            'name' => 'Manajer User',
            'email' => 'manajer@example.com',
            'role' => 'manajer',
        ]);
    }
}
