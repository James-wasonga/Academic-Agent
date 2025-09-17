from dotenv import load_dotenv
from pydantic import BaseModel
from langchain_openai import ChatOpenAI
from langchain_anthropic import ChatAnthropic 
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import PydanticOutputParser
from langchain.agents import create_tool_calling_agent, AgentExecutor
from tools import search_tool, wiki_tool, save_tool

load_dotenv()

class ResearchResponse(BaseModel):
    topic: str
    summary: str
    sources: str
    tool_used: list[str]

# llm = ChatOpenAI(model="gpt-4o-mini")
llm = ChatAnthropic(model="claude-3-5-sonnet-20241022")
parser = PydanticOutputParser(pydantic_object=ResearchResponse)

prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            """
            You are a research assistant that will help generate a research paper
            Answer the user query and use the necessary tools.
            Wrap the output in this format and provide no other text\n{format_instructions}
            """,
        ),
        ("placeholder", "{chat_hostory}"),
        ("human", "{query}"),
        ("placeholder", "{agent_scratchpad}"),
    ]
).partial(format_instructions=parser.get_format_instructions())

tools = [search_tool, wiki_tool, save_tool]
agent = create_tool_calling_agent(
    llm=llm, 
    prompt=prompt,
    tools=tools
)

agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)

# CLI Mode - only runs when this file is executed directly
def run_cli():
    """Run the command line interface"""
    query = input("What can I help you research? ")
    raw_response = agent_executor.invoke({"query": query})

    try:
        structured_response = parser.parse(raw_response.get("output")[0]["text"])
        print(structured_response)
    except Exception as e:  
        print("Error Parsing response", e, "Raw Response - ", raw_response)

# Only run CLI when this file is executed directly (not imported)
if __name__ == "__main__":
    run_cli()


# from dotenv import load_dotenv
# from pydantic import BaseModel
# from langchain_openai import ChatOpenAI
# from langchain_anthropic import ChatAnthropic 
# from langchain_core.prompts import ChatPromptTemplate
# from langchain_core.output_parsers import PydanticOutputParser
# from langchain.agents import create_tool_calling_agent, AgentExecutor
# from tools import search_tool, wiki_tool, save_tool


# load_dotenv()

# class ResearchResponse(BaseModel):
#     topic: str
#     summary: str
#     sources: str
#     tool_used: list[str]

# # llm = ChatOpenAI(model="gpt-4o-mini")
# llm = ChatAnthropic(model="claude-3-5-sonnet-20241022")
# parser = PydanticOutputParser(pydantic_object=ResearchResponse)
# # response = llm.invoke("What is the meaning of life ?")
# prompt = ChatPromptTemplate.from_messages(
#     [
#         (
#             "system",
#             """
#             You are a research assistant that will help generate a research paper
#             Answer the user query and use the neccessay tools.
#             Wrap the output in this format and provide no other text\n{format_instructions}
#             """,
            
#         ),
#         ("placeholder","{chat_hostory}"),
#         ("human", "{query}"),
#         ("placeholder", "{agent_scratchpad}"),
        
#     ]
# ).partial(format_instructions = parser.get_format_instructions())

# tools = [search_tool, wiki_tool, save_tool]
# agent = create_tool_calling_agent(
#     llm=llm, 
#     prompt=prompt,
#     tools=tools
     
# )

# agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)
# # maknig users key the query themselves
# query = input("What can I help you research?")
# raw_response = agent_executor.invoke({"query": query})

# try:
#     structured_response = parser.parse(raw_response.get("output")[0]["text"])
#     print(structured_response)
# except Exception as e:  
#     print("Error Passing response",e, "Raw Response - ",raw_response)
    
