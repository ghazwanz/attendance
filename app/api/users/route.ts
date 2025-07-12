// app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server'
// import { createAdmin } from '@/lib/supabase/client'
// import { z } from 'zod'
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);
// Define validation schema
// const CreateUserSchema = z.object({
//     name: z.string().min(1, "Name is required"),
//     email: z.string().email("Invalid email address"),
//     password: z.string().min(6, "Password must be at least 6 characters"),
// })

export async function POST(request: NextRequest) {
    try {
        // Parse request body
        const body = await request.json()

        // // Validate request data
        // const validated = CreateUserSchema.safeParse(body)

        // if (!validated.success) {
        //     const errorMessage = validated.error
        //     return NextResponse.json(
        //         { success: false, message: errorMessage },
        //         { status: 400 }
        //     )
        // }

        // Check admin authorization
        const { data: { user } } = await supabase.auth.getUser()

        // if (user?.user_metadata?.role !== 'admin') {
        //     return NextResponse.json(
        //         { success: false, message: "Only admin users can access this endpoint" },
        //         { status: 403 }
        //     )
        // }

        // Destructure validated data
        const { name, email, password } = body
        const role = "employee"

        // Create user with Supabase Admin API
        const { data, error } = await supabase.auth.admin.createUser({
            email: email,
            password: password,
            email_confirm: true,
            user_metadata: {
                name: name,
                role: role
            }
        })

        if (error) {
            return NextResponse.json(
                { success: false, message: error.message },
                { status: 400 }
            )
        }

        return NextResponse.json({
            success: true,
            message: "User successfully created",
            data: {
                id: data.user?.id,
                email: data.user?.email,
                name: data.user?.user_metadata?.name
            }
        })

    } catch (error) {
        console.error('Error creating user:', error)
        return NextResponse.json(
            { success: false, message: "Internal server error" },
            { status: 500 }
        )
    }
}