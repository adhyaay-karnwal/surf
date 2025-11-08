use serde_json::json;
use std::sync::Arc;

use crate::ai::brain::agents::{AgentIO, ContextManager, Tool};
use crate::ai::brain::js_tools::{JSToolRegistry, ToolName};
use crate::ai::llm::client::{CancellationToken, Model};
use crate::BackendResult;

#[allow(dead_code)]
pub struct BreezeletCreator {
    js_tool_registry: Arc<JSToolRegistry>,
}

#[allow(dead_code)]
impl BreezeletCreator {
    pub fn new(js_tool_registry: Arc<JSToolRegistry>) -> Self {
        Self { js_tool_registry }
    }

    // TODO: use a random id as well to correlate query & results
    fn format_breezelet_query(name: &str, prompt: &str) -> String {
        format!(
            "<answer>
                <breezelet data-name=\"{}\" data-prompt=\"{}\"></breezelet>
             </answer>",
            name, prompt
        )
    }
}

#[derive(serde::Deserialize)]
pub struct BreezeletArgs {
    name: String,
    prompt: String,
}

#[derive(serde::Deserialize)]
pub struct BreezeletDoneCallbackResult {
    status: String,
}

impl Tool for BreezeletCreator {
    fn name(&self) -> &str {
        "breezelet_creator"
    }

    fn description(&self) -> &str {
        "Creates a breezelet with the given name and prompt"
    }

    fn execution_message(&self) -> Option<&str> {
        Some("Creating a Breezelet...")
    }

    fn parameters_schema(&self) -> serde_json::Value {
        json!({
            "type": "object",
            "properties": {
                "name": {
                    "type": "string",
                    "description": "The name of the breezelet to create"
                },
                "prompt": {
                    "type": "string",
                    "description": "The prompt describing what the breezelet should do"
                }
            },
            "required": ["name", "prompt"]
        })
    }

    fn execute(
        &self,
        parameters: serde_json::Value,
        _execution_id: String,
        _model: Model,
        _custom_key: Option<String>,
        io: &dyn AgentIO,
        _context_manager: &mut dyn ContextManager,
        _cancellation_token: CancellationToken,
    ) -> BackendResult<()> {
        let args: BreezeletArgs = serde_json::from_value(parameters)?;

        let name = args.name;
        let prompt = args.prompt;

        io.write("<sources></sources>")?;
        io.write(&Self::format_breezelet_query(&name, &prompt))?;

        // _result mainly to tell `execute_tool` how to parse the result, we can ignore
        let _result: BreezeletDoneCallbackResult = self
            .js_tool_registry
            .execute_tool(&ToolName::BreezeletDoneCallback, Some(vec![name, prompt]))?;

        Ok(())
    }
}
