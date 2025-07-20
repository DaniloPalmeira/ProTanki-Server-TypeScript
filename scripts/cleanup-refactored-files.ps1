# Script para remover arquivos obsoletos após a refatoração

Write-Host "Removendo arquivos de missões (quests)..." -ForegroundColor Yellow
Remove-Item -Path @(
    "src/config/QuestData.ts",
    "src/services/QuestService.ts",
    "src/handlers/implementations/RequestQuestsWindowHandler.ts",
    "src/handlers/implementations/SkipQuestFreeHandler.ts",
    "src/handlers/implementations/SkipQuestPaidHandler.ts",
    "src/packets/implementations/NotifyDailyQuestGeneratedPacket.ts",
    "src/packets/implementations/ReplaceQuest.ts",
    "src/packets/implementations/RequestQuestsWindow.ts",
    "src/packets/implementations/ShowQuestsWindow.ts",
    "src/packets/implementations/SkipQuestFree.ts",
    "src/packets/implementations/SkipQuestPaid.ts",
    "src/packets/interfaces/INotifyDailyQuestGenerated.ts",
    "src/packets/interfaces/IReplaceQuest.ts",
    "src/packets/interfaces/IRequestQuestsWindow.ts",
    "src/packets/interfaces/IShowQuestsWindow.ts",
    "src/packets/interfaces/ISkipQuest.ts"
) -ErrorAction SilentlyContinue

Write-Host "Removendo arquivos de armas (weapons)..." -ForegroundColor Yellow
Remove-Item -Path @(
    # Flamethrower
    "src/handlers/implementations/StartShootingFlamethrowerCommandHandler.ts",
    "src/handlers/implementations/StopShootingFlamethrowerCommandHandler.ts",
    "src/packets/implementations/StartShootingFlamethrowerCommandPacket.ts",
    "src/packets/implementations/StartShootingFlamethrowerPacket.ts",
    "src/packets/implementations/StopShootingFlamethrowerCommandPacket.ts",
    "src/packets/implementations/StopShootingFlamethrowerPacket.ts",
    "src/packets/interfaces/IStartShootingFlamethrower.ts",
    "src/packets/interfaces/IStopShootingFlamethrower.ts",

    # Freeze
    "src/handlers/implementations/StartShootingFreezeCommandHandler.ts",
    "src/handlers/implementations/StopShootingFreezeCommandHandler.ts",
    "src/packets/implementations/StartShootingFreezeCommandPacket.ts",
    "src/packets/implementations/StartShootingFreezePacket.ts",
    "src/packets/implementations/StopShootingFreezeCommandPacket.ts",
    "src/packets/implementations/StopShootingFreezePacket.ts",
    "src/packets/interfaces/IStartShootingFreeze.ts",
    "src/packets/interfaces/IStopShootingFreeze.ts",

    # Machinegun
    "src/handlers/implementations/StartShootingMachinegunCommandHandler.ts",
    "src/handlers/implementations/StopShootingMachinegunCommandHandler.ts",
    "src/handlers/implementations/MachinegunShotCommandHandler.ts",
    "src/packets/implementations/StartShootingMachinegunCommandPacket.ts",
    "src/packets/implementations/StartShootingMachinegunPacket.ts",
    "src/packets/implementations/StopShootingMachinegunCommandPacket.ts",
    "src/packets/implementations/StopShootingMachinegunPacket.ts",
    "src/packets/implementations/MachinegunShotCommandPacket.ts",
    "src/packets/implementations/MachinegunShotPacket.ts",
    "src/packets/interfaces/IMachinegunShot.ts",

    # Railgun
    "src/handlers/implementations/RailgunShotCommandHandler.ts",
    "src/handlers/implementations/StartChargingCommandHandler.ts",
    "src/packets/implementations/RailgunShotCommandPacket.ts",
    "src/packets/implementations/RailgunShotPacket.ts",
    "src/packets/implementations/StartChargingCommandPacket.ts",
    "src/packets/implementations/StartChargingPacket.ts",
    "src/packets/interfaces/IRailgunShot.ts",
    "src/packets/interfaces/IStartCharging.ts",

    # Ricochet
    "src/handlers/implementations/RicochetShotCommandHandler.ts",
    "src/packets/implementations/RicochetShotCommandPacket.ts",
    "src/packets/implementations/RicochetShotPacket.ts",
    "src/packets/interfaces/IRicochetShot.ts",

    # Smoky
    "src/handlers/implementations/SmokyStaticShotCommandHandler.ts",
    "src/handlers/implementations/SmokyTargetShotCommandHandler.ts",
    "src/packets/implementations/SmokyStaticShotCommandPacket.ts",
    "src/packets/implementations/SmokyStaticShotPacket.ts",
    "src/packets/implementations/SmokyTargetShotCommandPacket.ts",
    "src/packets/implementations/SmokyTargetShotPacket.ts",
    "src/packets/interfaces/ISmokyShot.ts",

    # Thunder
    "src/handlers/implementations/ThunderShotNoTargetCommandHandler.ts",
    "src/handlers/implementations/ThunderStaticShotCommandHandler.ts",
    "src/handlers/implementations/ThunderTargetShotCommandHandler.ts",
    "src/packets/implementations/ThunderShotNoTargetCommandPacket.ts",
    "src/packets/implementations/ThunderShotNoTargetPacket.ts",
    "src/packets/implementations/ThunderStaticShotCommandPacket.ts",
    "src/packets/implementations/ThunderStaticShotPacket.ts",
    "src/packets/implementations/ThunderTargetShotCommandPacket.ts",
    "src/packets/implementations/ThunderTargetShotPacket.ts",
    "src/packets/interfaces/IThunderShot.ts"
) -ErrorAction SilentlyContinue

Write-Host "Limpeza concluída." -ForegroundColor Green