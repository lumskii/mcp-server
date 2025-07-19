import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { spawn } from "child_process";

async function main() {
    console.log("Starting MCP client...");
    
    try {
        // Start the server process
        const serverProcess = spawn("tsx", ["src/server.ts"], {
            stdio: ["pipe", "pipe", "inherit"],
            cwd: process.cwd()
        });

        // Create client transport
        const transport = new StdioClientTransport({
            command: "tsx",
            args: ["src/server.ts"]
        });

        // Create and connect client
        const client = new Client({
            name: "mcp-client",
            version: "1.0.0"
        }, {
            capabilities: {}
        });

        await client.connect(transport);
        console.log("Connected to MCP server!");

        // List server capabilities
        const result = await client.listTools();
        console.log("Server tools:", JSON.stringify(result, null, 2));

        // Cleanup
        serverProcess.kill();
        await client.close();
        
    } catch (error) {
        console.error("Client error:", error);
        process.exit(1);
    }
}

main().catch(console.error);
