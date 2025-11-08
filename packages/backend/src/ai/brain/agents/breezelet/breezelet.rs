use super::prompt::prompt;
use crate::ai::{
    brain::{
        agents::{breezelet::tools::BreezeletCreator, Agent, AgentConfig},
        js_tools::JSToolRegistry,
    },
    llm::client::LLMClient,
};
use std::sync::Arc;

pub fn create_breezelet_agent(
    client: Arc<LLMClient>,
    js_tool_registry: Arc<JSToolRegistry>,
) -> Agent {
    let system_prompt = prompt();

    let config = AgentConfig {
        name: "breezelet_agent".to_string(),
        max_iterations: 2,
        system_prompt,
        fallback_to_text: false,
        retry_on_parse_error: true,
        write_status_to_io: true,
        write_final_response_to_io: false,
    };
    let mut agent = Agent::new(client, config);

    let breezelet_creator_tool = BreezeletCreator::new(js_tool_registry);
    agent.add_tool(Box::new(breezelet_creator_tool));

    agent
}
