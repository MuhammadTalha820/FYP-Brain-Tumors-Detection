const path = require("path");
const { spawn } = require("child_process");
const router = require("express").Router();

router.get("/start-client", (req, res) => {
    // Update the path to point to your prediction.py file
    const scriptPath = path.resolve(__dirname, "../../federated_client/client_gui.py");


    // Spawn the Python process
    const pythonProcess = spawn("python", [scriptPath]);

    if (!pythonProcess) {
        console.error("Failed to start Python process.");
        return res.status(500).json({ success: false, error: "Python process failed to start." });
    }

    // Listen for data from the Python script's STDOUT
    pythonProcess.stdout.on("data", (data) => {
        console.log(`Python STDOUT: ${data}`);
    });

    // Listen for errors from the Python script's STDERR
    pythonProcess.stderr.on("data", (data) => {
        console.error(`Python STDERR: ${data}`);
    });

    // When the process closes, send an appropriate response back to the client
    pythonProcess.on("close", (code) => {
        console.log(`Python process exited with code ${code}`);
        if (code !== 0) {
            return res.status(500).json({ success: false, error: "Python process exited with error." });
        }
        res.status(200).json({ success: true, message: "Python prediction started successfully." });
    });

    // Catch process errors
    pythonProcess.on("error", (err) => {
        console.error(`Python process error: ${err.message}`);
        res.status(500).json({ success: false, error: "Python process failed." });
    });
});

module.exports = router;
