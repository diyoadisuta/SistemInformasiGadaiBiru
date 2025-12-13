<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$user = \App\Models\User::first();
if (!$user) {
    try {
        $user = \App\Models\User::create([
            'name' => 'Admin Test',
            'email' => 'admin@gadaibiru.com',
            'password' => bcrypt('password'),
            'role' => 'admin'
        ]);
    } catch (\Exception $e) {
        $user = \App\Models\User::where('email', 'admin@gadaibiru.com')->first();
    }
}
if (!$user) {
    echo "Failed to create/find user.";
    exit(1);
}
$token = $user->createToken('test-curl')->plainTextToken;
echo "TOKEN: " . $token;
