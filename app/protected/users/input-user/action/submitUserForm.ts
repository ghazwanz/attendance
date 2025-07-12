"use server"

import { createClient } from "@supabase/supabase-js"
import { z } from "zod"

// Define validation schema
const CreateUserSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
})

export async function submitUserForm(currentState: any, formData: FormData) {
    // Check auth
    // const auth = createClientSide()
    // const user = await auth.auth.getUser()
    // console.log(user)
    // if (user.data.user?.user_metadata.role !== 'admin') {
    //     return { success: false, message: "Only admin user can access this" }
    // }

    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );


    // Validate submission against schema
    const validated = CreateUserSchema.safeParse({
        name: formData.get("name"),
        email: formData.get("email"),
        password: formData.get("password"),
    })

    // Early return if doesn't check out
    if (!validated.success) {
        const errorMessage = validated.error
        return { success: false, message: errorMessage }
    }

    // Destructure
    const { name, email, password } = validated.data
    const role = "employee"

    try {
        const res = supabase.auth.admin.createUser({
            email: email,
            password: password,
            email_confirm: true,
            user_metadata: {
                name: name,
                role: role
            }
        })

        if ((await res).error?.message) {
            return { success: false, message: (await res).error?.message }
        }

        return { success: true, message: "User successfully created" }
    } catch (err) {
        return { success: false, message: "Failed to create user" }
    }
}