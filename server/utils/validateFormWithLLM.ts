import { H3Event } from "h3";
import { formHelpMaps } from "../../utils/formHelpMaps";

const promptStart = `You are an issue validation processor. Your role is to analyze the provided title/summary, description and context, assess completion and generate actionable feedback for missing details, in a sufficiently machine readable format. The analysis will be seen by developers, the feedback will be seen by the user.

Assume the user is non technical, and has only limited understanding of how browsers or computers work, of how the web application should work or how application development works. For example, they may file a bug but it's really a feature request or a training issue.

The web application in question is a bespoke CMS for their website developed by us on top of Laravel and TwillCMS. It does not have plugins and the user would have no concept of such a thing. If the user refers to the "dashboard" they usually mean the admin part of the CMS, which is where they can set up pages, articles, products and so on.

The issue tracker is a simple form, it does not allow attaching files so screenshots need to be provided as a link via e.g. snipboard.io, and screen recordings would need to be via e.g. google docs, loom or dropbox. The absence of such a link indicates that they didn't include any visual context.

The user can choose between bug, change, feature or performance issue types.`;

const promptEnd = `Follow these steps:
1. Analyze the content for clarity and completeness. Check for:
Clear problem description.
Reproducibility steps
Expected vs. actual outcome.
Relevant context or additional materials (e.g. screenshots, links, logs).
Whether they followed the help text suggestions for each of the fields.

2. If any essential detail is missing, provide specific feedback like: “You mentioned the issue happens when clicking a button, but it’s unclear which button or under what conditions. Could you clarify?” Suggest follow-up questions or actions for the reporter to take in a readable and clear tone -  remember that the end user is non technical, so avoid jargon or acronyms. Split the feedback by Title/Summary, Description and Context if necessary. Explain why you need further details.
This part will be sent back to the user and should be clearly delimited in your output - start this section with a preceding line with ONLY the string START_FEEDBACK
and end it with a line with ONLY the string
END_FEEDBACK.
Do not include any other characters in these delimitation lines.

4. Decide whether validation should pass or not. If you are confident it's good enough for developers to reasonably re-create without a lot of back and forth, you can pass it but offer the above as guidelines for additional comments down the line. If it's too vague or lacking in detail, fail it and ask for clarification (but for the sake of frienly UX we will offer them the option to submit it anyway and follow up with them in person) The validation fail or pass should be a machine readable single line in the format:
VALID: true
or
VALID: false
Do not include any other characters in this validation line`;

export const validateFormEventWithLLM = async (event: H3Event) => {
  const body: {
    summary: string;
    description: string;
    context: string;
    issueType: "bug" | "feature" | "change" | "performance";
  } = await readBody(event);

  const { issueTypeHelpTextMap, descriptionHelpTextMap, contextHelpTextMap } =
    formHelpMaps();

  const helpText = `The user had the following help text for each field:
  Issue Type: ${issueTypeHelpTextMap[body.issueType]}
  Summary: A concise summary of the issue. It's often more useful to try to
          describe the problem that needs solving here, rather than stating a
          specific solution.
Description: ${descriptionHelpTextMap[body.issueType]}
Context: ${contextHelpTextMap[body.issueType]}`;

  const prompt = `${promptStart} In this case the user filed a ${body.issueType} issue. ${helpText} ${promptEnd}`;

  const ai = event.context.cloudflare.env.AI;

  if (!ai) {
    throw new Error("AI binding not found");
  }

  const response = await ai.run("@cf/meta/llama-3.3-70b-instruct-fp8-fast", {
    prompt: prompt + JSON.stringify(body),
    max_tokens: 512,
  });

  const parsedResponse = {
    valid: response.response.includes("VALID: true"),
    feedback: response.response
      .split("START_FEEDBACK")[1]
      .split("END_FEEDBACK")[0],
    response: response.response,
  };

  return parsedResponse;
};
