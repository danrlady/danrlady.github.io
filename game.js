

/* ===== KABOOM CONFIG ===== */
kaboom({
    global: true,
    fullscreen: true,
    width: window.innerWidth,
    height: window.innerHeight,
    scale: 2,
    debug: true,
    clearColor: [0, 0, 0]
});

const HERO_SPEED = 120;
const SLICER_SPEED = 150;
const SKELETON_SPEED = 100;
const MUSIC_VOLUME = 1.5;

/* ===== GAME SCENE ===== */
scene('game', ({ level, score }) => {
    /* ===== GAME CONFIG ===== */
    const levelConfig = {
        width: 48,
        height: 48,
        'a': [sprite('top-left-wall'), 'wall', solid()],
        'b': [sprite('top-wall'), 'wall', solid()],
        'c': [sprite('top-right-wall'), 'wall', solid()],
        'd': [sprite('left-wall'), 'wall', solid()],
        'e': [sprite('right-wall'), 'wall', solid()],
        'f': [sprite('bottom-left-wall'), 'wall', solid()],
        'g': [sprite('bottom-wall'), 'wall', solid()],
        'h': [sprite('bottom-right-wall'), 'wall', solid()],
        'p': [sprite('left-door'), 'wall', 'next-level'],
        'q': [sprite('left-door'), 'door', 'wall', solid()],
        'n': [sprite('top-door'), 'wall', 'next-level'],
        'u': [sprite('top-door'), 'wall', 'door', solid()],
        'w': [sprite('fire-pot'), solid()],
        '-': [sprite('fire-pot'), 'block', solid()],
        'l': [sprite('lanterns'), 'wall', solid()],
        's': [sprite('stairs'), 'next-level'],
        '?': [sprite('stairs'), 'wall', solid()],
        '@': [sprite('skeleton'), 'skeleton', 'dangerous', { dir: -1, timer: 0 }],
        '*': [sprite('slicer'), 'slicer', 'dangerous', { dir: -1 }],
        '!': [sprite('green-rupee'), 'rupee', { value: 1 }],
        '#': [sprite('blue-rupee'), 'rupee', { value: 5 }],
        '$': [sprite('red-rupee'), 'rupee', { value: 20 }],
        '%': [sprite('silver-rupee'), 'rupee', { value: 100 }],
        '&': [sprite('gold-rupee'), 'rupee', { value: 300 }],
        'ˆ': [sprite('triforce'), 'triforce']
    };

    const maps = [
        [
            'abblbnblbc',
            'd  #     e',
            'd      * l',
            'l w    w e',
            'q    !   e',
            'l w    w e',
            'd        l',
            'd *      e',
            'd      $ e',
            'fgglggglgh'
        ],
        [
            'ablbbbblbc',
            'd%    s  e',
            'd *      e',
            'l w    w l',
            'd  @ * & e',
            'l w    w l',
            'd      * e',
            'd        e',
            'd  #     e',
            'fglgguglgh'
        ],
        [
            'abbbbbbbbc',
            'd #   ?  e',
            'd *      e',
            'd @w w w e',
            'd    &@  e',
            'd %w w w e',
            'd   @    e',
            'd   *  $ e',
            'p        e',
            'fggggggggh'
        ],
        [
            'abbbbbbbbc',
            'd        e',
            'd --%--- e',
            'd -!- s- e',
            'd -   -& e',
            'd $- --- e',
            'd -  !   e',
            'd -------e',
            'd    #   q',
            'fggggggggh'
        ],
        [
            'abbbbbbbbc',
            'd---- ---e',
            'd     *  e',
            'd - &--? e',
            'd %------e',
            'd -ˆ     e',
            'd ------ e',
            'd     *  e',
            'd--- ----e',
            'fggggggggh'
        ]
    ];

    const music = play('game', {
        volume: MUSIC_VOLUME,
        loop: true
    });

    layers(['bg', 'obj', 'ui'], 'obj');
    add([sprite('floor'), layer('bg')]);
    addLevel(maps[level], levelConfig);

    /* ===== UI CONFIG ===== */
    const scoreLabel = add([
        text(`score: ${score}`),
        pos(620, 50),
        layer('ui'),
        scale(2),
        {
            value: score
        }
    ]);
    add([
        text(`level: ${level + 1}`),
        pos(620, 80),
        layer('ui'),
        scale(2)
    ]);
    add([
        text('use [keyboard] to move'),
        pos(560, 400),
        layer('ui'),
        scale(1.5)
    ]);
    add([
        text('press [space] to attack'),
        pos(555, 420),
        layer('ui'),
        scale(1.5)
    ]);
    add([
        sprite('tlor'),
        pos(455, 90),
        scale(0.15)
    ]);

    /* ===== ENEMIES CONFIG ===== */
    action('slicer', (s) => {
        s.move(s.dir * SLICER_SPEED, 0);
    });

    collides('dangerous', 'wall', s => {
        s.dir = -s.dir;
    });

    collides('skeleton', 'block', s => {
        s.dir = -s.dir;
    });

    action('skeleton', s => {
        s.move(0, s.dir * SKELETON_SPEED);
        s.timer -= dt();
        if (s.timer <= 0) {
            s.dir = -s.dir;
            s.timer = rand(10);
        }
    });

    collides('kaboom', 'skeleton', (k, s) => {
        camShake(5);
        destroy(s);
        wait(0.2, () => {
            destroy(k);
        });
        scoreLabel.value++;
        scoreLabel.text = `score: ${scoreLabel.value}`;
    });

    /* ===== PLAYER CONFIG ===== */
    const player = add([
        sprite('link-right'),
        pos(playerStartPosition(level).hpos,
            playerStartPosition(level).vpos),
        {
            dir: vec2(1, 0),
            isAlive: true
        }
    ]);

    function playerStartPosition(level) {
        switch (level + 1) {
            case 1:
                return { hpos: 5, vpos: 190 };
            case 2:
                return { hpos: 230, vpos: 400 };
            case 3:
                return { hpos: 310, vpos: 5 };
            case 4:
                return { hpos: 400, vpos: 370 };
            case 5:
                return { hpos: 400, vpos: 150 };
            default:
                return { hpos: 0, vpos: 0 };
        }
    }

    function playerStartSprite(level) {
        switch (level + 1) {
            case 1:
                player.changeSprite('link-right');
                break;
            case 2:
                player.changeSprite('link-up');
                break;
            case 3:
                player.changeSprite('link-right');
                break;
            case 4:
                player.changeSprite('link-left');
                break;
            case 5:
                player.changeSprite('link-right');
                break;
            default:
                player.changeSprite('link-right');
        }
    }

    playerStartSprite(level);

    player.action(() => {
        player.resolve();
    });

    /* ===== PLAYER MOVEMENT ===== */
    keyDown('left', () => {
        if (!!player.isAlive) {
            player.changeSprite('link-left');
            player.move(-HERO_SPEED, 0);
            player.dir = vec2(-1, 0);
        }
    });

    keyDown('right', () => {
        if (!!player.isAlive) {
            player.changeSprite('link-right');
            player.move(HERO_SPEED, 0);
            player.dir = vec2(1, 0);
        }
    });

    keyDown('up', () => {
        if (!!player.isAlive) {
            player.changeSprite('link-up');
            player.move(0, -HERO_SPEED);
            player.dir = vec2(0, -1);
        }
    });

    keyDown('down', () => {
        if (!!player.isAlive) {
            player.changeSprite('link-down');
            player.move(0, HERO_SPEED);
            player.dir = vec2(0, 1);
        }
    });

    /* ===== PLAYER INTERACTIONS ===== */
    player.overlaps('next-level', () => {
        music.stop();
        go('game', {
            level: (level + 1),
            score: scoreLabel.value
        });
    });

    player.overlaps('rupee', r => {
        play('rupee', { volume: 2 });
        destroy(r);
        scoreLabel.value += r.value;
        scoreLabel.text = `score: ${scoreLabel.value}`;
    });

    player.overlaps('triforce', () => {
        wait(0.8, () => {
            music.stop();
            go('game-cleared', {
                score: scoreLabel.value
            });
        });
    });

    player.overlaps('dangerous', () => {
        player.isAlive = false;
        camShake(10);
        wait(0.5, () => {
            music.stop();
            go('game-over', { score: scoreLabel.value });
        });
    });

    player.collides('door', d => {
        destroy(d);
    });

    keyPress('space', () => {
        play('kaboom', { volume: 4 });
        spawnKaboom(player.pos.add(player.dir.scale(48)));
    });

    function spawnKaboom(p) {
        const obj = add([sprite('kaboom'), pos(p), 'kaboom']);
        wait(1, () => {
            destroy(obj);
        });
    };
});

/* ===== OPEN SCENE ===== */
scene('open', () => {
    const timer = setInterval(() => {
        const obj = add([
            sprite('open-triforce'),
            origin('center'),
            pos(422, 220),
            scale(0.5)
        ]);
        wait(0.6, () => {
            destroy(obj);
        });
    }, 1200);

    wait(5, () => {
        add([
            text('i hope you like it', 8),
            origin('center'),
            pos((width() / 2) - 20, (height() / 2) + 130)
        ]);
        add([
            text('press [space] to start', 8),
            origin('center'),
            pos((width() / 2) - 20, (height() / 2) + 150)
        ]);
    });

    keyPress('space', () => {
        wait(0.5, () => {
            clearInterval(timer);
            go('title');
        });
    });
});

/* ===== TITLE SCENE ===== */
scene('title', () => {
    const music = play('menu', {
        volume: MUSIC_VOLUME,
        loop: true
    });

    add([
        sprite('tlor'),
        origin('center'),
        pos(410, 250),
        scale(0.3)
    ]);

    const timer = setInterval(() => {
        const obj = add([
            text('press [space] to start', 12),
            origin('center'),
            pos(width() / 2, (height() / 2) + 150)
        ]);
        wait(0.6, () => {
            destroy(obj);
        });
    }, 1200);

    keyPress('space', () => {
        wait(0.5, () => {
            clearInterval(timer);
            music.stop();
            go('game', { level: 0, score: 0 });
        });
    });
});

/* ===== GAME OVER SCENE ===== */
scene('game-over', ({ score }) => {
    const music = play('lose', {
        volume: MUSIC_VOLUME,
        loop: true
    });
    add([
        text('game over', 32),
        origin('center'),
        pos(width() / 2, (height() / 2) - 50)
    ]);
    add([
        text(`score: ${score}`, 22),
        origin('center'),
        pos(width() / 2, height() / 2)
    ]);

    add([
        text('press [space] to restart', 22),
        origin('center'),
        pos(width() / 2, (height() / 2) + 50)
    ]);

    keyPress('space', () => {
        wait(0.5, () => {
            music.stop();
            go('game', { level: 0, score: 0 });
        });
    });
});

/* ===== GAME CLEARED SCENE ===== */
scene('game-cleared', ({ score }) => {
    const music = play('win', {
        volume: MUSIC_VOLUME,
        loop: true
    });
    add([
        text(`score: ${score}`, 12),
        origin('center'),
        pos(width() / 2, (height() / 2) - 200)
    ]);
    add([
        text('happy birthday, raffa!', 35),
        origin('center'),
        pos(width() / 2, (height() / 2) - 100)
    ]);
    wait(3, () => {
        add([
            sprite('chest'),
            origin('center'),
            pos(width() / 2, (height() / 2) + 30),
            scale(1.2)
        ]);
        add([
            text('here is your prize', 22),
            origin('center'),
            pos(width() / 2, (height() / 2) + 100)
        ]);
        setInterval(() => {
            const obj = add([
                text('<game code here>', 42),
                origin('center'),
                pos(width() / 2, (height() / 2) + 150)
            ]);
            wait(0.6, () => {
                destroy(obj);
            });
        }, 1200);
    });

});

/* ===== GAME START ===== */
start('open');

/* ===== SPRITES ===== */
loadSprite('tlor', 'assets/sprites/tlor-logo.png');
loadSprite('top-left-wall', 'assets/sprites/xlpUxIm.png');
loadSprite('top-wall', 'assets/sprites/QA257Bj.png');
loadSprite('top-right-wall', 'assets/sprites/z0OmBd1.jpeg');
loadSprite('left-wall', 'assets/sprites/rfDoaa1.png');
loadSprite('right-wall', 'assets/sprites/SmHhgUn.png');
loadSprite('bottom-left-wall', 'assets/sprites/awnTfNC.png');
loadSprite('bottom-wall', 'assets/sprites/vWJWmvb.png');
loadSprite('bottom-right-wall', 'assets/sprites/84oyTFy.png');
loadSprite('top-door', 'assets/sprites/U9nre4n.png');
loadSprite('left-door', 'assets/sprites/okdJNls.png');
loadSprite('fire-pot', 'assets/sprites/I7xSp7w.png');
loadSprite('lanterns', 'assets/sprites/wiSiY09.png');
loadSprite('stairs', 'assets/sprites/VghkL08.png');
loadSprite('floor', 'assets/sprites/u4DVsx6.png');
loadSprite('green-rupee', 'assets/sprites/um2utxD.png');
loadSprite('blue-rupee', 'assets/sprites/7DitzPL.png');
loadSprite('red-rupee', 'assets/sprites/STyGqLH.png');
loadSprite('silver-rupee', 'assets/sprites/Ykz0lRF.png');
loadSprite('gold-rupee', 'assets/sprites/QIawGhH.png');
loadSprite('triforce', 'assets/sprites/iVvcIvM.png');
loadSprite('chest', 'assets/sprites/chest.png');
loadSprite('skeleton', 'assets/sprites/Ei1VnX8.png');
loadSprite('slicer', 'assets/sprites/c6JFi5Z.png');
loadSprite('link-down', 'assets/sprites/r377FIM.png');
loadSprite('link-left', 'assets/sprites/eiY5zyX.png');
loadSprite('link-right', 'assets/sprites/yZIb8O2.png');
loadSprite('link-up', 'assets/sprites/UkV0we0.png');
loadSprite('kaboom', 'assets/sprites/o9WizfI.png');
loadSprite('open-triforce', 'assets/sprites/open-triforce.png');

/* ===== MUSIC ===== */
loadSound('menu', 'assets/sounds/tlor-menu.mp3');
loadSound('game', 'assets/sounds/tlor-game.mp3');
loadSound('win', 'assets/sounds/tlor-win.mp3');
loadSound('lose', 'assets/sounds/tlor-lose.mp3');
loadSound('rupee', 'assets/sounds/tlor-rupee.mp3');
loadSound('kaboom', 'assets/sounds/tlor-kaboom.mp3');
