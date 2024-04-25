const config = require("../config");
const { command, isPrivate, getJson, sleep, tiny } = require("../lib/");
const { Image } = require("node-webpmux");
const fs = require("fs-extra")

command(
  {
    pattern: "sticker ?(.*)",
    fromMe: isPrivate,  
    desc: "_Converts Photo or video to sticker_",
    type: "converter",
  },
  async (message, match, m , conn) => {
    try{
    if (!(message.reply_message.video || message.reply_message.image))
      return await message.reply("_Reply to photo or video_");
    let buff = await m.quoted.download();
  
    message.sendMessage(
      buff,
      { packname: config.PACKNAME, author: config.AUTHOR , quoted : message },
      "sticker"
    );
   
  } catch (error) {
    console.error("[Error]:", error);
  }
  }
);

command(
  {
    pattern: "tgs ?(.*)",
    fromMe: isPrivate,  
    desc: "Download Sticker From Telegram",
    type: "Tool",
  },
  async (message, match) => {
    try{
    if (!match)
      return message.reply(
        "_Enter a tg sticker url_\nEg: https://t.me/addstickers/Oldboyfinal\nKeep in mind that there is a chance of ban if used frequently"
      );
    let packid = match.split("/addstickers/")[1];
    let { result } = await getJson(
      `https://api.telegram.org/bot891038791:AAHWB1dQd-vi0IbH2NjKYUk-hqQ8rQuzPD4/getStickerSet?name=${encodeURIComponent(
        packid
      )}`
    );
    if (result.is_animated)
      return message.reply("_Animated stickers are not supported_");
    message.reply(
      `*Total stickers :* ${result.stickers.length}\n*Estimated complete in:* ${
        result.stickers.length * 1.5
      } seconds`.trim()
    );
    for (let sticker of result.stickers) {
      let file_path = await getJson(
        `https://api.telegram.org/bot891038791:AAHWB1dQd-vi0IbH2NjKYUk-hqQ8rQuzPD4/getFile?file_id=${sticker.file_id}`
      );
      await message.sendMessage(
        `https://api.telegram.org/file/bot891038791:AAHWB1dQd-vi0IbH2NjKYUk-hqQ8rQuzPD4/${file_path.result.file_path}`,
        { packname: config.PACKNAME, author: config.AUTHOR },
        "sticker"
      );
      sleep(1500);
    }
  } catch (error) {
    console.error("[Error]:", error);
  }
  }
);

command(
  {
    pattern: "take ?(.*)",
    fromMe: isPrivate,  
    desc: "Changes Exif data of stickers",
    type: "tool",
  },
  async (message, match, m) => {
    try{
    if (!message.reply_message && !message.reply_message.sticker)
      return await message.reply("_Reply to sticker_");
    let buff = await m.quoted.download();
    let [packname, author] = match.split(":");
    await message.sendMessage(
      buff,
      {
        packname: packname || config.PACKNAME,
        author: author || config.AUTHOR,
      },
      "sticker"
    );
  } catch (error) {
    console.error("[Error]:", error);
  }
  }
);

command(
  {
    pattern: "getexif ?(.*)",
    fromMe: isPrivate,  
    desc: "description",
    type: "type",
  },
  async (message, match, m) => {
    try{
    if (!message.reply_message || !message.reply_message.sticker)
      return await message.reply("_Reply to sticker_");
    let img = new Image();
    await img.load(await m.quoted.download());
    const exif = JSON.parse(img.exif.slice(22).toString());
    await message.reply(exif);
  } catch (error) {
    console.error("[Error]:", error);
  }
  }
);
