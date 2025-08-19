import React from 'react';

import LocationTable from './LocationTable';

// ...other imports...

export default function LocationPage() {
	return (
		<div className="max-w-2xl mx-auto mt-8">
			<h2 className="text-2xl font-bold mb-4">🗺️ Lokasi: Mahative Studio</h2>
			{/* Tabel lokasi perusahaan */}
			<div>
				{/* @ts-ignore */}
				<LocationTable />
			</div>
		</div>
	);
}
