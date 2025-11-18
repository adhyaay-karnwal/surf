use super::prompt::prompt;
use crate::ai::{
    brain::{
        agents::{mistlet::tools::MistletCreator, Agent, AgentConfig},
        js_tools::JSToolRegistry,
    },
    llm::client::LLMClient,
};
use std::sync::Arc;

pub fn create_mistlet_agent(
    client: Arc<LLMClient>,
    js_tool_registry: Arc<JSToolRegistry>,
) -> Agent {
    let system_prompt = prompt();

    let config = AgentConfig {
        name: "mistlet_agent".to_string(),
        max_iterations: 2,
        system_prompt,
        fallback_to_text: false,
        retry_on_parse_error: true,
        write_status_to_io: true,
        write_final_response_to_io: false,
    };
    let mut agent = Agent::new(client, config);

    let mistlet_creator_tool = MistletCreator::new(js_tool_registry);
    agent.add_tool(Box::new(mistlet_creator_tool));

    agent
}
