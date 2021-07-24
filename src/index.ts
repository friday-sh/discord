import Discord from "discord.js";
import fetch from "cross-fetch";
import { config } from "dotenv";
config();

interface Client extends Discord.Client {
  owner: string;
}

const bot = new Discord.Client() as Client;
bot.owner = process.env.DISCORD_OWNER_ID;

const getCtx = async () => {
  const data = await fetch(`http://localhost:6060/location`).then((res) =>
    res.json()
  );
  return data;
};

let ctx: any = null;

bot.on("ready", async () => {
  console.log(`Logged in as ${bot.user.tag}`);
  bot.user.setPresence({ status: "dnd" });
  ctx = await getCtx();
});

bot.on("message", async (message) => {
  if (message.content.toLowerCase().startsWith("f ")) {
    const content = message.content
      .toLowerCase()
      .replace("f ", "")
      .replace("+", "plus");

    if (!content) return;

    const query = encodeURI(content);

    const data = await fetch("http://localhost:6060/v1", {
      method: "POST",
      body: JSON.stringify({
        text: query,
        discord: message.author.id,
        location: ctx,
      }),
    }).then((res) => res.json());

    if (data.result) message.channel.send(data.result);
  }
});

bot.login(process.env.DISCORD_TOKEN);
