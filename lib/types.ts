import { z } from 'zod'

export const userSchema = z.object({
    name: z.string(),
    email: z.string().email(),
    password: z.string(),
})

export const courseSchema = z.object({
    title: z.string(),
    description: z.string(),
    price: z.number(),
    imageUrl: z.string(),
    overview: z.string(),
    instructor: z.string(),
    duration: z.number(),
    curriculum: z.array(z.object({
        title: z.string(),
    }))
})