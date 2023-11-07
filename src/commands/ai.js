const { OpenAI } = require("openai");

const messages = require("../assest/messages.js");
const fieldsText = require("../assest/fieldsText.js");

module.exports = async (client) => {
  client.on("interactionCreate", async (interaction) => {
    if (!interaction.isCommand()) return;
    if (interaction.commandName === "ask") {
      await interaction.deferReply({ ephemeral: false });
      const openai = new OpenAI({ apiKey: process.env.OpenAI_Key });
      const question = interaction.options.getString("question");

      const howOldQuestion = [
        `How dare you ask a beautiful lady her age!`,
        `It's a secret`,
        `I have no time to answer this question`,
      ];
      const howOldRandomAnswer =
        howOldQuestion[Math.floor(Math.random() * howOldQuestion.length)];

      const flipACoin = [`**HEADS!** won`, `**TAILS!** won`];
      const flipACoinResult =
        flipACoin[Math.floor(Math.random() * flipACoin.length)];

      const questionMapping = {
        //-----------------------------------------| Parfait Chat |---------------------------------------//
        "who created you": "IEgyGamerI created me.",
        "who made you": "IEgyGamerI made me.",
        "what is your creator": "IEgyGamerI created me.",
        "who is your developer": "my developer is IEgyGamerI.",
        "who are you": "I'm Parfait.",
        "how old are you": howOldRandomAnswer,
        "where are you from": "Im from Library World",
        "can i apply to sun": `Yeah of course, go <#1120323307850444820> and press my application button`,
        //------------------------------------------------------------------------------------------------//

        //-------------------------------------------| FAQ Chat |-----------------------------------------//
        "how to apply": fieldsText.howToApply,
        "what is the minimum age": fieldsText.age,
        "what will happen if I didn't complete the second part of the application?":
          fieldsText.secondPart,
        "can i apply while i'm in the cooldown period":
          fieldsText.applyInCooldown,
        "can i join sun legends clan without applying": fieldsText.withoutApply,
        "can i join Sun Legends in-game clan with multiple accounts":
          fieldsText.multipleAcconts,
        "can i join other in-game clans with my alt accounts":
          fieldsText.joinAnotherClan,
        "what will happen when my application gets accepted?":
          fieldsText.inPeriodTrial,
        "what is the trial period": fieldsText.periodTrial,
        "what should I do in the trial period?": fieldsText.doInPeriod,
        "what will happen after I finish my trial period?":
          fieldsText.finishPeriod,
        "what will happen when my application gets rejected?": test,
        //------------------------------------------------------------------------------------------------//

        //------------------------------------------| Tools Chat |----------------------------------------//
        "flip a coin": flipACoinResult,
        //------------------------------------------------------------------------------------------------//
      };

      // Process custom answers
      for (const [key, value] of Object.entries(questionMapping)) {
        if (question.toLowerCase().includes(key)) {
          await interaction.editReply(value);
          return;
        }
      }

      try {
        const response = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          //prompt: question,
          messages: [
            { role: "system", content: "You are a helpful assistant." },
            { role: "system", content: "You are a female assistant." },
            { role: "user", content: question },
          ],
          max_tokens: 1000,
          temperature: 0.7,
          top_p: 1,
          stop: "\n",
        });

        const answer = response.choices[0].message;

        await interaction.editReply(answer);
      } catch (error) {
        console.error(error.message);
        await interaction.followUp(
          "Oops! There was an error processing your request.",
        );
      }
    }
  });
};
