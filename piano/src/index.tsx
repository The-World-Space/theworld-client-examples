
import "./index.css";
import ReactDOM from "react-dom";
import React from "react";
import App from "./Components/App";
import { Client } from "theworld-client";
import { TheWorldProvider } from "theworld-client-react";


const client = new Client();
client.addBroadcasterPort('key');


const root = document.createElement("div");
root.id = "root";
document.body.appendChild(root);

ReactDOM.render(
    <TheWorldProvider client={client} loading={() => <div>Loading</div>}>
        <App/>
    </TheWorldProvider>
, root);