<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Surat Gadai - {{ $transaction->transaction_number }}</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
        .company-name { font-size: 24px; font-weight: bold; text-transform: uppercase; }
        .document-title { font-size: 20px; font-weight: bold; margin: 20px 0; text-align: center; text-decoration: underline; }
        .section { margin-bottom: 15px; }
        .row { display: flex; margin-bottom: 5px; }
        .label { width: 150px; font-weight: bold; }
        .value { flex: 1; border-bottom: 1px dotted #ccc; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        .footer { margin-top: 50px; display: flex; justify-content: space-between; text-align: center; }
        .signature-box { width: 200px; }
        .signature-line { margin-top: 60px; border-top: 1px solid #333; }
        .terms { font-size: 10px; margin-top: 30px; border-top: 1px solid #ccc; padding-top: 10px; }
        @media print {
            body { padding: 0; }
            button { display: none; }
        }
    </style>
</head>
<body onload="window.print()">
    <div class="header">
        <div class="company-name">GADAI BIRU ELEKTRONIK</div>
        <div>Jl. Contoh No. 123, Kota Bandung, Jawa Barat</div>
        <div>Telp: (022) 1234567 | Email: info@gadaibiru.com</div>
    </div>

    <div class="document-title">SURAT BUKTI GADAI (SBG)</div>

    <div class="section">
        <div class="row">
            <span class="label">No. Transaksi</span>
            <span class="value">: {{ $transaction->transaction_number }}</span>
        </div>
        <div class="row">
            <span class="label">Tanggal Gadai</span>
            <span class="value">: {{ \Carbon\Carbon::parse($transaction->start_date)->translatedFormat('d F Y') }}</span>
        </div>
        <div class="row">
            <span class="label">Jatuh Tempo</span>
            <span class="value">: {{ \Carbon\Carbon::parse($transaction->due_date)->translatedFormat('d F Y') }}</span>
        </div>
    </div>

    <div class="section">
        <h3>Data Nasabah</h3>
        <div class="row">
            <span class="label">Nama Lengkap</span>
            <span class="value">: {{ $transaction->customer->name }}</span>
        </div>
        <div class="row">
            <span class="label">NIK</span>
            <span class="value">: {{ $transaction->customer->nik }}</span>
        </div>
        <div class="row">
            <span class="label">No. Telepon</span>
            <span class="value">: {{ $transaction->customer->phone }}</span>
        </div>
        <div class="row">
            <span class="label">Alamat</span>
            <span class="value">: {{ $transaction->customer->address }}</span>
        </div>
    </div>

    <div class="section">
        <h3>Barang Jaminan</h3>
        <table>
            <thead>
                <tr>
                    <th>Nama Barang</th>
                    <th>Kategori</th>
                    <th>Merk</th>
                    <th>Taksiran Nilai</th>
                </tr>
            </thead>
            <tbody>
                @foreach($transaction->items as $item)
                <tr>
                    <td>{{ $item->name }}</td>
                    <td>{{ $item->category }}</td>
                    <td>{{ $item->brand }}</td>
                    <td>Rp {{ number_format($item->estimated_value, 0, ',', '.') }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>
    </div>

    <div class="section">
        <h3>Rincian Pinjaman</h3>
        <div class="row">
            <span class="label">Uang Pinjaman</span>
            <span class="value">: Rp {{ number_format($transaction->loan_amount, 0, ',', '.') }}</span>
        </div>
        <div class="row">
            <span class="label">Bunga ({{ $transaction->interest_rate }}%)</span>
            <span class="value">: Rp {{ number_format($transaction->interest_amount, 0, ',', '.') }}</span>
        </div>
    </div>

    <div class="footer">
        <div class="signature-box">
            <div>Nasabah</div>
            <div class="signature-line">{{ $transaction->customer->name }}</div>
        </div>
        <div class="signature-box">
            <div>Petugas</div>
            <div class="signature-line">Admin Gadai Biru</div>
        </div>
    </div>

    <div class="terms">
        <strong>Syarat & Ketentuan:</strong>
        <ol>
            <li>Barang jaminan akan dilelang jika tidak ditebus atau diperpanjang sampai tanggal jatuh tempo.</li>
            <li>Surat ini merupakan bukti sah transaksi gadai.</li>
            <li>Hilangnya surat ini segera lapor ke petugas kami.</li>
        </ol>
    </div>
</body>
</html>
