import { ButtonInteraction } from "discord.js";
import { PrismaService } from "../../prisma/prisma.service";

export const convoyConfirmInteractionHandler = async (
    prisma: PrismaService, 
    interaction: ButtonInteraction
): Promise<void> => {
    const [_, action, convoyId] = interaction.customId.split('_');

    const convoy = await prisma.convoy.findFirst({
        where: {
            id: convoyId
        }
    });

    if (convoy && convoy.responseDeadline > new Date()) {
        // Find if member is already a participant in the convoy
        const convoyParticipant = await prisma.convoyParticipant.findFirst({
            where: {
                convoyId: convoy.id,
                AND: {
                    member: {
                        discordUserId: interaction.user.id
                    }
                }
            }
        });

        // If member is already a participant
        if (convoyParticipant &&convoyParticipant?.status === 'CONFIRMED') await interaction.reply({ content: 'Mano, calma ae que tu já ta confirmado', ephemeral: true});

        if (!convoyParticipant || convoyParticipant?.status === 'DECLINED') {
            if (convoy?.status === 'CLOSED') await interaction.reply({ content: 'Esse evento já passou mano!!! Fica mais ligado na próxima', ephemeral: true });

            if (convoy?.status === 'OPEN') {
                const member = await prisma.member.upsert({
                    where: {
                        discordUserId: interaction.user.id,
                    },
                    update: {
                        username: interaction.user.username,
                    },
                    create: {
                        discordUserId: interaction.user.id,
                        username: interaction.user.username,
                        displayName: interaction.member?.user.username,
                    },
                });

                await prisma.convoyParticipant.upsert({
                    where: {
                        convoyId_memberId: {
                        convoyId,
                        memberId: member.id,
                        },
                    },
                    update: {
                        status: 'CONFIRMED',
                        responseSource: 'SERVER',
                        respondedAt: new Date(),
                        updatedByAdmin: false,
                    },
                    create: {
                        convoyId,
                        memberId: member.id,
                        status: 'CONFIRMED',
                        responseSource: 'SERVER',
                        respondedAt: new Date(),
                    },
                });
                
                await interaction.reply({ content: 'Tu ta confirmado manin, bem vindo a lista **VIP**', ephemeral: true });
            }
        }
    } else {
        await interaction.reply({ content: 'Ihh o tempo pra se inscrever já foi meu bom, mas se realmente tiver afim de colar, da um toque em algum adm ai, fechou? Valeu', flags: 64 });
    }
}

export const convoyCancelInteractionHandler = async (
    prisma: PrismaService, 
    interaction: ButtonInteraction
): Promise<void> => {
    const [_, action, convoyId] = interaction.customId.split('_');

    const convoy = await prisma.convoy.findFirst({
        where: {
            id: convoyId
        }
    });

    if (convoy && convoy.responseDeadline > new Date()) {
        // Find if member is already a participant in the convoy
        const convoyParticipant = await prisma.convoyParticipant.findFirst({
            where: {
                convoyId: convoy.id,
                AND: {
                    member: {
                        discordUserId: interaction.user.id
                    }
                }
            }
        });

        // If member is not a participant and try to decline
        if(!convoyParticipant || convoyParticipant?.status === 'DECLINED') await interaction.reply({ content: 'O manin, tu já ta fora, ce ta ligado ne?', ephemeral: true});

        // If member is not a participant update status to confirmed
        if(convoyParticipant && convoyParticipant?.status === 'CONFIRMED') {
            // Verify if convoy is closed
            if (convoy?.status === 'CLOSED') await interaction.reply({ content: 'Esse evento já passou mano!!! Fica mais ligado na próxima', ephemeral: true });
            
            // Verify if convoy is open before update participant status
            if (convoy?.status === 'OPEN') {
                await prisma.convoyParticipant.update({
                    where: {
                        id: convoyParticipant.id
                    },
                    data: {
                        status: 'DECLINED',
                        responseSource: 'SERVER',
                        updatedAt: new Date(),
                        updatedByAdmin: false,
                    }
                });       

                await interaction.reply({ content: 'Beleza manin, tu ta fora, maaas se mudar de ideia ta ligado onde vir...', ephemeral: true });
            }
        }
    } else {
        await interaction.reply({ content: 'Ihh o tempo pra se inscrever já foi meu bom, mas se realmente tiver afim de colar, da um toque em algum adm ai, fechou? Valeu', flags: 64 });
    }
}

export const convoyParticipantListHandler = async (
    prisma: PrismaService,
    interaction: ButtonInteraction
): Promise<void> => {
    const [_, action, convoyId] = interaction.customId.split('_');

    const convoy = await prisma.convoy.findUnique({
        where: {
            id: convoyId
        }
    });

    // Check if convoy exists
    if(convoy) {
        // Check if convoy is closed and return a message to inform this status
        if(convoy.status === 'CLOSED') await interaction.reply({ content: 'Esse evento já passou mano!!! Fica mais ligado na próxima', ephemeral: true });

        // If convoy is open return the list of participants confirmed
        if(convoy.status === 'OPEN') {
            const participants = await prisma.convoyParticipant.findMany({
                where: {
                    convoyId: convoy.id,
                    status: 'CONFIRMED'
                },
                include: {
                    member: true
                }
            });

            if(participants.length === 0) await interaction.reply({ content: 'Ainda não tem ninguém confirmado, chama a galera pra colar!!!', ephemeral: true });

            if(participants.length > 0) await interaction.reply({
                content: `Ta aí que vai colar na parada🔥🏎️🔥:\n${participants.map(members => `- ${members.member.displayName || members.member.username}`).join('\n')}`,

            });
        }
    }
}
