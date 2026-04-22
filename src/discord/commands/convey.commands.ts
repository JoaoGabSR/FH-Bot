import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Channel, EmbedBuilder, Message, PermissionFlagsBits, TextBasedChannel, TextChannel } from "discord.js";
import { PrismaService } from "../../prisma/prisma.service";
import { ParticipantStatus, ResponseSource } from "@prisma/client";
import { TConvoyWithRelations } from "../../@types/convoy-with-relations";
import { formatDateAndHour } from "../../common/format-date";

export async function handleConvoyCommand(
    message: Message, 
    prisma: PrismaService,
    channel: Channel | null
) {
    // Validate if message contains has date, hour and location
    if (!validateConvoyMessageFormat(message.content)) {
        // Send error message and explains the error
        await message.reply('Formato inválido. Use: /comboio DD-MM HH:MM Local - ou algum dado informado não é válido!');
        return;
    }

    // Collect data from message
    const messageData: string[] = message.content.split(' ');

    const convoyDayAndMonth: string[] = messageData[1].split('-');
    const convoyCompleteHour: string[] = messageData[2].split(':');

    // Create a complete date to save in db
    const eventDate: Date = new Date(
        new Date().getFullYear(),
        Number(convoyDayAndMonth[1]) - 1,
        Number(convoyDayAndMonth[0]),
        Number(convoyCompleteHour[0]),
        Number(convoyCompleteHour[1])
    );

    // Get the convoy location
    const location = messageData.slice(3).join(' ').trim();;

    // Limit date what bot gonna recive participants response
    const responseDeadline: Date = new Date(eventDate);
    responseDeadline.setHours(responseDeadline.getHours() - 8);

    // Save convoy in database
    const convoy = await createAndSaveConvoyInDB(prisma, message, eventDate, location, responseDeadline);

    responseFromBot(message, convoy, channel);
}

// Message format validator
const validateConvoyMessageFormat = (message: string): boolean => {
    const parts: string[] = message.split(' ');
    
    if (parts.length < 4) return false;
    
    const datePart: string = parts[1];
    const timePart: string = parts[2];
    const locationPart: string = parts.slice(3).join(' ').trim();
    
    // Date valiation: DD-MM
    const dateSplit = datePart.split('-');

    if (dateSplit.length !== 2) return false;
    
    const day = parseInt(dateSplit[0], 10);
    const month = parseInt(dateSplit[1], 10);
    
    if (isNaN(day) || isNaN(month)) return false;
    
    if (month < 1 || month > 12) return false;
    
    let maxDays = Number(month) == 2 ? 28 : [1,3,5,7,8,10,12].includes(month) ? 31 : 30;

    if (day < 1 || day > maxDays) return false;
    
    // Hour validation: HH:MM
    const timeSplit = timePart.split(':');

    if (timeSplit.length !== 2) return false;
    
    const hour = parseInt(timeSplit[0], 10);
    const minute = parseInt(timeSplit[1], 10);

    if (isNaN(hour) || isNaN(minute)) return false;
    
    if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return false;
    
    // Location never be a empty string
    if (!locationPart) return false;
    
    return true;
};

// Create and save convoy in database
const createAndSaveConvoyInDB = async (
    prisma: PrismaService, message: Message,
    eventDate: Date,
    location: string,
    responseDeadline: Date,
): Promise<TConvoyWithRelations> => {
    const createdConvoy = await prisma.$transaction(async (tx) => {
        const member = await tx.member.upsert({
            where: {
                discordUserId: message.author.id
            },
            update: {
                username: message.author.username,
                displayName: message.member?.displayName
            },
            create: {
                discordUserId: message.author.id,
                username: message.author.username,
                displayName: message.member?.displayName,
                isAdmin: message.member?.permissions.has(PermissionFlagsBits.Administrator)
            }
        });

        const convoy = await tx.convoy.create({
            data: {
                eventDate,
                location,
                responseDeadline,
                createdById: member.id,
                participants: {
                    create: {
                        memberId: member.id,
                        status: ParticipantStatus.CONFIRMED,
                        responseSource: ResponseSource.SERVER,
                        respondedAt: new Date()
                    }
                }
            },
            include: {
                createdBy: true,
                participants: {
                    include: {
                        member: true
                    }
                }
            }
        });

        return convoy;
    });

    return createdConvoy;
}

const responseFromBot = async (
  message: Message,
  convoy: TConvoyWithRelations,
  channel: Channel | null
): Promise<void> => {
    // Validate if channel exists and is text based
    if (!channel || !channel.isTextBased()) {
        throw new Error('Canal inválido ou não suporta envio de mensagens');
    }

    // Embed message with convoy details and buttons to confirm, decline or see the list of participants
    const embed = new EmbedBuilder()
      .setTitle('Vamo rodar meus manos 🏎️ ...')
      .setDescription(
        `O manin **${message.author.displayName}** ta chamando geral pra da aquele pião, então bora se organizar aí, aquecer esses motores e ir pras ruas mostrar quem tem o maldito talento! 🏎️🔥
        Onde? **${convoy.location}**, às **${formatDateAndHour(convoy.eventDate)}** não se atrasem hein, porque ces tão ligados, quem chegar por último é sempre o **PATINHO** de geral!!!
        Mais um detalhezinho seus viciados em cheiro de pneu queimando no asfalto, tem que confirmar presença, a parada é **VIP**, se ligou ? Então se tá afim de colar, responde aí, custa nada, valeu? E de preferência responde rápido, até **${formatDateAndHour(convoy.responseDeadline)}**, então bora rodaaar seus lunáticos, que meu sangue já ta fervendo pra correr até os motores ferverem!!!`
      )
      .setFooter({text: `Aqui é o parça favorito da galera, o **Corredor FH**, passando as melhores calls pelo rádio!!!`});

    // Action buttons to embed message
    const buttons = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
            .setCustomId(`convoy_confirm_${convoy.id}`)
            .setLabel('To colando... 😎🔥')
            .setStyle(ButtonStyle.Success),

        new ButtonBuilder()
            .setCustomId(`convoy_decline_${convoy.id}`)
            .setLabel('Num vai rolar... 😕')
            .setStyle(ButtonStyle.Danger),

        new ButtonBuilder()
            .setCustomId(`convoy_list_${convoy.id}`)
            .setLabel('Confirmados... 👀')
            .setStyle(ButtonStyle.Secondary),
    );

    const textChannel = channel as TextChannel;

    await textChannel.send({
        embeds: [embed],
        components: [buttons],
    });

    // Reply to user that created the convoy
    await message.reply({ content: 'Eiiita, que a lista **VIP** ta aberta, aí, so falta da aquele toque nos manos' });
};
