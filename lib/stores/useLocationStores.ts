
import { create } from "zustand"

export type LocationState = {
    isOutside: boolean
    setIsOutside: (value: boolean) => void
}

export type UserLocationState = {
    location: { lat: number, lng: number } | null
    setLocation: ({ lat, lng }: { lat: number, lng: number }) => void
}

export const useLocationStores = create<LocationState>((set) => ({
    isOutside: true,
    setIsOutside: (value) => set({ isOutside: value })
}))

export const useUserLocationStores = create<UserLocationState>((set) => ({
    location: null,
    setLocation: ({ lat, lng }) => set({ location: { lat, lng } })
}))

