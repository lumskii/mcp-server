import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js"
import z from "zod"
import fs from "node:fs/promises"

const server = new McpServer({
    name: "mcp-server",
    version: "1.0.0",
    capabilities: {
        resources: {},
        tools: {},
        prompts: {},
    }
})

server.tool("create-user", "Create a new user in the database", {
    name: z.string(),
    email: z.string(),
    address: z.string(),
    phone: z.string()
}, {
    title: "Create User",
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: false,
    openWorldHint: true,
}, async (params) => {
    try {
        const id = await createUser(params)
        return {
            content: [
                { type: "text", text: `User ${id} created successfully` }
            ]
        }
    } catch {
        return {
            content: [
                { type: "text", text: "Error creating user" }
            ]
        }
    }
})

async function createUser(user: {
    name: string;
    email: string;
    address: string;
    phone: string;
}) {
    const users = await import("./data/users.json", {
        with: { type: "json" }
    }).then(data => data.default)

    const id = users.length + 1

    users.push({id, ...user})

    fs.writeFile("./src/data/users.json", JSON.stringify(users, null, 2))
    return id
}

async function main() {
    try {
        const transport = new StdioServerTransport()
        await server.connect(transport)
        console.error("MCP server connected successfully");
    } catch (error) {
        console.error("Failed to start MCP server:", error);
        process.exit(1);
    }
}

main().catch((error) => {
    console.error("Unhandled error:", error);
    process.exit(1);
});