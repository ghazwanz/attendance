// Create a new file: components/LocationEffectComponent.tsx
"use client"

import { UseUserLocationEffect } from '@/lib/utils/getUserLocation';

export default function LocationEffectComponent() {
    UseUserLocationEffect();
    return null; // This component doesn't render anything visible
}

// Then in your main component, use it like this:
// const LocationEffect = dynamic(() => import('@/components/LocationEffectComponent'), {
//   ssr: false,
// });