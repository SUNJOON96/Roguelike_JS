import chalk from 'chalk';
import readlineSync from 'readline-sync';

class Player {
  constructor(name, hp, attackPower) {
    this.name = name;
    this.hp = hp;
    this.attackPower = attackPower;
    this.maxHp = hp;
  }

  // 기본 검 공격: 100% 확률로 성공
  swordAttack(monster, logs) {
    monster.hp -= this.attackPower;
    logs.push(`${this.name}가 ${monster.name}에게 검 공격! ${this.attackPower}의 피해를 입혔다.`);
  }

  // 창 공격: 일정 확률로 급소 공격 (공격력 증가)
  spearAttack(monster, logs) {
    const criticalHit = Math.random() < 0.3; // 30% 확률로 급소 공격
    const damage = criticalHit ? this.attackPower * 1.5 : this.attackPower;
    monster.hp -= damage;
    logs.push(`${this.name}가 창으로 ${monster.name}를 공격! ${damage}의 피해를 입혔다.`);
    if (criticalHit) {
      logs.push(`급소를 찔렀다!`);
    }
  }

  // 활 공격: 일정 확률로 두 번 공격
  bowAttack(monster, logs) {
    const doubleHit = Math.random() < 0.4; // 40% 확률로 2번 공격
    const attacks = doubleHit ? 2 : 1;
    let totalDamage = 0;
    for (let i = 0; i < attacks; i++) {
      monster.hp -= this.attackPower;
      totalDamage += this.attackPower;
    }
    logs.push(`${this.name}가 활로 ${monster.name}를 공격! 총 ${totalDamage}의 피해를 입혔다.`);
    if (doubleHit) {
      logs.push(`2번 공격이 성공했다!`);
    }
  }

  // 방어: 일정 확률로 방어 성공 시 몬스터의 60% 공격력으로 반격
  defend(monster, logs) {
    const defendSuccess = Math.random() < 0.7; // 70% 확률로 방어 성공
    if (defendSuccess) {
      const counterAttack = Math.floor(monster.attackPower * 0.6);
      monster.hp -= counterAttack;
      logs.push(`${this.name}가 방어에 성공! 반격으로 ${counterAttack}의 피해를 입혔다.`);
    } else {
      logs.push(`${this.name}가 방어에 실패했다.`);
      monster.attack(this, logs); // 방어 실패 시 몬스터의 공격을 받음
    }
  }


  // HP 회복 메서드
  recover(logs) {
    const recoverAmount = Math.floor(this.maxHp * 0.3);
    this.hp = Math.min(this.hp + recoverAmount, this.maxHp);
    logs.push(`${this.name}의 HP가 ${recoverAmount} 회복되었습니다! 현재 HP: ${this.hp}`);
  }

  increaseAttackPower() {
    this.attackPower += Math.floor(Math.random() * 5 + 20);
  }
}

class Monster {
  constructor(name, hp, attackPower) {
    this.name = name;
    this.hp = hp;
    this.attackPower = attackPower;
  }

  attack(player, logs) {
    if (player.hp > 0) {
      player.hp -= this.attackPower;
      logs.push(`${this.name}가 ${player.name}에게 ${this.attackPower}의 피해!!`);
      logs.push(`${player.name}의 남은 HP는 ${player.hp}!!`);
    } else {
      logs.push(`${player.name} 쓰러졌다...`);
    }
  }
}

function displayStatus(stage, player, monster, logs) {
  console.clear();
  logs.forEach(log => console.log(log));
  console.log(chalk.magentaBright(`\n=== Current Status ===`));
  console.log(
    chalk.cyanBright(`| Stage: ${stage} `) +
    chalk.blueBright(
      `| 플레이어 정보| HP = ${player.hp}, 공격력 = ${player.attackPower}`
    ) +
    chalk.redBright(
      ` | 몬스터 정보 | HP = ${monster.hp}, 공격력 = ${monster.attackPower}`
    ),
  );
  console.log(chalk.magentaBright(`=====================\n`));
}

const battle = async (stage, player, monster, logs) => {
  let escape = false;

  while (player.hp > 0 && monster.hp > 0) {
    displayStatus(stage, player, monster, logs);

    console.log(
      chalk.green(
        `\n1. 검 공격 2. 창 공격 3. 활 공격 4. 방어 5. 도망`,
      ),
    );
    const choice = readlineSync.question('당신의 선택은? ');

    switch (choice) {
      case '1':
        player.swordAttack(monster, logs);
        monster.attack(player, logs);
        break;

      case '2':
        player.spearAttack(monster, logs);
        monster.attack(player, logs);
        break;

      case '3':
        player.bowAttack(monster, logs);
        monster.attack(player, logs);
        break;

      case '4':
        player.defend(monster, logs);
        break;

      case '5':
        escape = true;
        return escape;

      default:
        logs.push(chalk.green(`잘못된 선택입니다.`));
    }

    if (monster.hp <= 0) {
      logs.push(`${monster.name}을(를) 물리쳤다!`);
      break;
    }
  }
  
  return escape;
};

export async function startGame() {
  console.clear();
  const player = new Player("용사", 100, 10);
  let stage = 1;
  let logs = [];

  while (stage <= 10) {
    const monster = new Monster(`SLIME${stage}`, stage * 100, stage * 2);
    const escape = await battle(stage, player, monster, logs);

    if (player.hp <= 0) {
      console.clear();
      logs.push('GAME OVER...');
      break;
    }

    if (!escape) {
      player.recover(logs); // 스테이지 클리어 시 회복
      player.increaseAttackPower(); // 스테이지 클리어 시 공격력 증가
      logs.push(chalk.yellowBright(`\n스테이지 ${stage} 클리어!\n`));
    } 

    if (stage === 10) {
      logs.push('축하합니다! 클리어!');
    } else {
      logs.push(`다음 스테이지로 이동합니다. Stage ${stage + 1}`);
    }

    stage++;
  }
}
