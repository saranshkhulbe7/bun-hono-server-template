# [ server-name ] Server

## Throwing Error/////

Always throw error like
throw new ApiError(500, "Not Implemented");
can refer to class ApiError in utils/ApiError.ts

## Sending Responses

Always send response like
return c.json(new ApiResponse(200, data));
can refer to class ApiResponse in utils/ApiResponse.ts

We are taking this approach because we want to have a consistent response format for all our APIs. This will make it easier to understand and handle errors and responses in the frontend.

## Environment Variables

We are using Zod to validate the environment variables.
You can refer to the env.ts file for the validation logic.
You just need to add environment variables to the zod object (envVariables) env.ts file whenever you add a new environment variable.
