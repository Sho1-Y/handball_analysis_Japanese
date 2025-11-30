// ハンドボール試合分析ツール - JavaScript

let plays = [];
let timer = 0;
let isRunning = false;
let timerInterval = null;
let teamAName = 'Rakusei';
let teamBName = 'Ryoyo';
let currentTeam = 'A';
let currentHalf = '前半';
let currentPosition = '';
let currentShotCourse = '';
let currentResult = '';
let currentPhase = '';
let capturedTimeValue = null;
let editingIndex = null;

// タイマー関連
function toggleTimer() {
    isRunning = !isRunning;
    if (isRunning) {
        timerInterval = setInterval(() => {
            timer++;
            updateTimerDisplay();
        }, 1000);
    } else {
        clearInterval(timerInterval);
    }
}

function resetTimer() {
    isRunning = false;
    clearInterval(timerInterval);
    timer = 0;
    updateTimerDisplay();
}

function updateTimerDisplay() {
    const minutes = Math.floor(timer / 60);
    const seconds = timer % 60;
    document.getElementById('timerDisplay').textContent = 
        `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function setManualTime() {
    const minutes = parseInt(document.getElementById('manualMinutes').value) || 0;
    const seconds = parseInt(document.getElementById('manualSeconds').value) || 0;
    timer = minutes * 60 + seconds;
    updateTimerDisplay();
}

function updateHalf() {
    currentHalf = document.getElementById('halfSelect').value;
}

function captureTime() {
    capturedTimeValue = {
        time: timer,
        half: currentHalf
    };
    const minutes = Math.floor(timer / 60);
    const seconds = timer % 60;
    document.getElementById('capturedTime').textContent = 
        `[${currentHalf}] ${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

// チーム名更新
function updateTeamNames() {
    teamAName = document.getElementById('teamAName').value || 'Aチーム';
    teamBName = document.getElementById('teamBName').value || 'Bチーム';
    document.getElementById('teamAHeader').textContent = teamAName;
    document.getElementById('teamBHeader').textContent = teamBName;
    updateStats();
}

// チーム選択
function selectTeam(team) {
    currentTeam = team;
    document.getElementById('teamABtn').classList.remove('selected');
    document.getElementById('teamBBtn').classList.remove('selected');
    document.getElementById(`team${team}Btn`).classList.add('selected');
}

// 展開選択
function selectPhase(phase) {
    // 既に選択されている場合は解除
    if (currentPhase === phase) {
        currentPhase = '';
        document.querySelectorAll('.phase-buttons .btn-grid').forEach(btn => {
            btn.classList.remove('selected');
        });
    } else {
        currentPhase = phase;
        document.querySelectorAll('.phase-buttons .btn-grid').forEach(btn => {
            btn.classList.remove('selected');
        });
        event.target.classList.add('selected');
    }
}

// 位置選択
function selectPosition(pos) {
    // 既に選択されている場合は解除
    if (currentPosition === pos) {
        currentPosition = '';
        document.querySelectorAll('.position-grid-extended .btn-grid').forEach(btn => {
            btn.classList.remove('selected');
        });
    } else {
        currentPosition = pos;
        document.querySelectorAll('.position-grid-extended .btn-grid').forEach(btn => {
            btn.classList.remove('selected');
        });
        event.target.classList.add('selected');
    }
}

// シュートコース選択
function selectShotCourse(course) {
    // 既に選択されている場合は解除
    if (currentShotCourse === course) {
        currentShotCourse = '';
        document.querySelectorAll('.shot-course-grid .btn-grid').forEach(btn => {
            btn.classList.remove('selected');
        });
    } else {
        currentShotCourse = course;
        document.querySelectorAll('.shot-course-grid .btn-grid').forEach(btn => {
            btn.classList.remove('selected');
        });
        event.target.classList.add('selected');
    }
}

// 結果選択
function selectResult(result) {
    currentResult = result;
    // 全ての結果ボタンから選択状態を削除
    document.querySelectorAll('.result-buttons button').forEach(btn => {
        btn.classList.remove('selected');
    });
    // クリックされたボタンに選択状態を追加
    event.target.classList.add('selected');
}

// プレー追加
function addPlay() {
    // 編集モードの場合は、編集フォームから時刻を取得
    if (editingIndex !== null) {
        const editMinutes = parseInt(document.getElementById('editMinutes').value) || 0;
        const editSeconds = parseInt(document.getElementById('editSeconds').value) || 0;
        const editHalf = document.getElementById('editHalf').value;
        
        capturedTimeValue = {
            time: editMinutes * 60 + editSeconds,
            half: editHalf
        };
    } else {
        // 新規追加の場合は、キャプチャ済み時刻が必要
        if (!capturedTimeValue) {
            alert('「現在時刻を入力」ボタンを押して時刻を確定してください');
            return;
        }
    }
    
    const play = {
        team: currentTeam,
        playerNumber: document.getElementById('playerNumber').value || '',
        position: currentPosition || '',
        shotCourse: currentShotCourse || '',
        result: currentResult || '',
        phase: currentPhase || '',
        time: capturedTimeValue.time,
        half: capturedTimeValue.half,
        timestamp: Date.now()
    };
    
    if (editingIndex !== null) {
        plays[editingIndex] = play;
        editingIndex = null;
        document.getElementById('editForm').style.display = 'none';
    } else {
        plays.push(play);
    }
    
    // 入力フィールドをクリア
    document.getElementById('playerNumber').value = '';
    currentPosition = '';
    currentShotCourse = '';
    currentResult = '';
    currentPhase = '';
    
    document.querySelectorAll('.btn-grid.selected').forEach(btn => {
        btn.classList.remove('selected');
    });
    document.querySelectorAll('.result-buttons button').forEach(btn => {
        btn.classList.remove('selected');
    });
    
    updateScoresheet();
    updateStats();
}

// スコアシート更新
function updateScoresheet() {
    const tbody = document.getElementById('scoresheetBody');
    tbody.innerHTML = '';
    
    let teamAScore = 0;
    let teamBScore = 0;
    
    plays.forEach((play, index) => {
        const row = document.createElement('tr');
        
        // 得点計算
        if (play.result === '1') {
            if (play.team === 'A') {
                teamAScore++;
            } else {
                teamBScore++;
            }
        }
        
        const minutes = Math.floor(play.time / 60);
        const seconds = play.time % 60;
        const timeStr = `[${play.half}] ${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        
        const phaseLabels = {
            'set': 'セット',
            'fast1': '1次',
            'fast2': '2次',
            '7m': '7m'
        };
        const phaseLabel = play.phase ? phaseLabels[play.phase] || play.phase : '-';
        
        const playerInfo = play.playerNumber ? 
            `${play.playerNumber}(${play.position}${play.shotCourse ? '/' + play.shotCourse : ''})` :
            `(${play.position}${play.shotCourse ? '/' + play.shotCourse : ''})`;
        
        if (play.team === 'A') {
            row.innerHTML = `
                <td class="row-num">${index + 1}</td>
                <td>${playerInfo}</td>
                <td>${play.result}</td>
                <td>${play.result === '1' ? teamAScore : ''}</td>
                <td>${timeStr}</td>
                <td></td>
                <td></td>
                <td></td>
                <td>${phaseLabel}</td>
                <td><button class="btn-warning" onclick="editPlay(${index})">編集</button></td>
            `;
        } else {
            row.innerHTML = `
                <td class="row-num">${index + 1}</td>
                <td></td>
                <td></td>
                <td></td>
                <td>${timeStr}</td>
                <td>${play.result === '1' ? teamBScore : ''}</td>
                <td>${play.result}</td>
                <td>${playerInfo}</td>
                <td>${phaseLabel}</td>
                <td><button class="btn-warning" onclick="editPlay(${index})">編集</button></td>
            `;
        }
        
        tbody.appendChild(row);
    });
}

// プレー編集 - すべての項目を編集可能に
function editPlay(index) {
    editingIndex = index;
    const play = plays[index];
    
    // 編集フォームを表示
    document.getElementById('editForm').style.display = 'block';
    document.getElementById('editRowNum').textContent = index + 1;
    
    // 時間設定（編集フォームの時間入力欄に設定）
    const editMinutes = Math.floor(play.time / 60);
    const editSeconds = play.time % 60;
    document.getElementById('editHalf').value = play.half;
    document.getElementById('editMinutes').value = editMinutes;
    document.getElementById('editSeconds').value = editSeconds;
    
    // 時刻表示を更新（キャプチャ時刻表示エリアにも反映）
    capturedTimeValue = {
        time: play.time,
        half: play.half
    };
    document.getElementById('capturedTime').textContent = 
        `[${play.half}] ${String(editMinutes).padStart(2, '0')}:${String(editSeconds).padStart(2, '0')}`;
    
    // チーム選択を復元
    currentTeam = play.team;
    document.getElementById('teamABtn').classList.remove('selected');
    document.getElementById('teamBBtn').classList.remove('selected');
    document.getElementById(`team${play.team}Btn`).classList.add('selected');
    
    // 背番号を復元
    document.getElementById('playerNumber').value = play.playerNumber;
    
    // 現在の選択状態を保存
    currentPosition = play.position;
    currentShotCourse = play.shotCourse;
    currentResult = play.result;
    currentPhase = play.phase;
    
    // すべてのボタンの選択状態をクリア
    document.querySelectorAll('.btn-grid').forEach(btn => {
        btn.classList.remove('selected');
    });
    document.querySelectorAll('.result-buttons button').forEach(btn => {
        btn.classList.remove('selected');
    });
    
    // 展開ボタンの選択状態を復元
    if (play.phase) {
        document.querySelectorAll('.phase-buttons .btn-grid').forEach(btn => {
            const phaseMap = {
                'セットオフェンス': 'set',
                '1次速攻': 'fast1',
                '2次速攻': 'fast2',
                '7m': '7m'
            };
            if (phaseMap[btn.textContent] === play.phase) {
                btn.classList.add('selected');
            }
        });
    }
    
    // 位置ボタンの選択状態を復元
    if (play.position) {
        document.querySelectorAll('.position-grid-extended .btn-grid').forEach(btn => {
            if (btn.textContent === play.position) {
                btn.classList.add('selected');
            }
        });
    }
    
    // シュートコースボタンの選択状態を復元
    if (play.shotCourse) {
        document.querySelectorAll('.shot-course-grid .btn-grid').forEach(btn => {
            if (btn.textContent === play.shotCourse) {
                btn.classList.add('selected');
            }
        });
    }
    
    // 結果ボタンの選択状態を復元
    if (play.result) {
        const resultMap = {
            '1': 'result1',
            '0': 'result0',
            'TurnOver': 'resultTO',
            '警告': 'resultWarn',
            '退場': 'resultOut',
            '追放': 'resultBan',
            'TimeOut': 'resultTimeout'
        };
        const buttonId = resultMap[play.result];
        if (buttonId) {
            document.getElementById(buttonId).classList.add('selected');
        }
    }
    
    // ページの上部にスクロール（編集フォームが見えるように）
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function saveEdit() {
    // 編集内容を保存（addPlay関数が編集モードを検知して処理）
    addPlay();
}

function cancelEdit() {
    editingIndex = null;
    document.getElementById('editForm').style.display = 'none';
    document.getElementById('playerNumber').value = '';
    currentPosition = '';
    currentShotCourse = '';
    currentResult = '';
    currentPhase = '';
    capturedTimeValue = null;
    document.getElementById('capturedTime').textContent = '--:--';
    
    document.querySelectorAll('.btn-grid.selected').forEach(btn => {
        btn.classList.remove('selected');
    });
    document.querySelectorAll('.result-buttons button').forEach(btn => {
        btn.classList.remove('selected');
    });
}

function deletePlay() {
    if (editingIndex !== null && confirm('このプレーを削除しますか？')) {
        plays.splice(editingIndex, 1);
        cancelEdit();
        updateScoresheet();
        updateStats();
    }
}

// タブ切り替え
function showTab(tabName) {
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
    });
    event.target.classList.add('active');
    
    document.getElementById('scoresheetTab').style.display = 'none';
    document.getElementById('successTab').style.display = 'none';
    document.getElementById('midgameTab').style.display = 'none';
    document.getElementById('playerTab').style.display = 'none';
    document.getElementById('shotcourseTab').style.display = 'none';
    
    document.getElementById(`${tabName}Tab`).style.display = 'block';
    updateStats();
}

// 展開判定（phase優先、なければpositionから判定）
function getPhase(play) {
    if (play.phase) return play.phase;
    
    const position = play.position;
    if (position === '7m') return '7m';
    if (['RPV', 'CPV', 'LPV'].includes(position)) return 'fast1';
    if (['RW', 'LW'].includes(position)) return 'fast2';
    return 'set';
}

// 統計更新
function updateStats() {
    updateSuccessStats();
    updateMidgameStats();
    updatePlayerStats();
    updateShotCourseStats();
}

// 成功率統計（表形式）
function updateSuccessStats() {
    const stats = { A: {}, B: {} };
    
    ['A', 'B'].forEach(team => {
        stats[team] = {
            set: { success: 0, fail: 0, turnover: 0 },
            fast1: { success: 0, fail: 0, turnover: 0 },
            fast2: { success: 0, fail: 0, turnover: 0 },
            '7m': { success: 0, fail: 0, turnover: 0 }
        };
    });
    
    plays.forEach(play => {
        if (['1', '0', 'TurnOver'].includes(play.result)) {
            const phase = getPhase(play);
            if (play.result === '1') stats[play.team][phase].success++;
            else if (play.result === '0') stats[play.team][phase].fail++;
            else if (play.result === 'TurnOver') stats[play.team][phase].turnover++;
        }
    });
    
    const table = document.getElementById('successStatsTable');
    table.innerHTML = '';
    
    ['A', 'B'].forEach(team => {
        const teamName = team === 'A' ? teamAName : teamBName;
        
        // チーム名ヘッダー
        const headerRow = document.createElement('tr');
        headerRow.innerHTML = `<th colspan="6" style="background: #1976D2; font-size: 16px;">${teamName}</th>`;
        table.appendChild(headerRow);
        
        // 列ヘッダー
        const colHeader = document.createElement('tr');
        colHeader.innerHTML = `
            <th>展開</th>
            <th>成功</th>
            <th>失敗</th>
            <th>TurnOver</th>
            <th>合計</th>
            <th>成功率</th>
        `;
        table.appendChild(colHeader);
        
        const phases = [
            { key: 'set', label: 'セットオフェンス' },
            { key: 'fast1', label: '1次速攻' },
            { key: 'fast2', label: '2次速攻' },
            { key: '7m', label: '7m' }
        ];
        
        phases.forEach(({ key, label }) => {
            const s = stats[team][key];
            const total = s.success + s.fail + s.turnover;
            const rate = total > 0 ? (s.success / total).toFixed(2) : '-';
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="label-col">${label}</td>
                <td>${s.success}</td>
                <td>${s.fail}</td>
                <td>${s.turnover}</td>
                <td>${total}</td>
                <td><strong>${rate}</strong></td>
            `;
            table.appendChild(row);
        });
    });
}

// 試合中統計（表形式）
function updateMidgameStats() {
    const team = document.getElementById('midgameTeamSelect').value;
    const teamName = team === 'A' ? teamAName : teamBName;
    
    const playerStats = {};
    
    plays.filter(p => p.team === team && ['1', '0'].includes(p.result)).forEach(play => {
        const num = play.playerNumber || '不明';
        if (!playerStats[num]) {
            playerStats[num] = {
                RW: { s: 0, t: 0 },
                Long: { s: 0, t: 0 },
                Middle: { s: 0, t: 0 },
                LW: { s: 0, t: 0 }
            };
        }
        
        const ps = playerStats[num];
        let category = '';
        
        if (play.position === 'RW') category = 'RW';
        else if (play.position === 'LW') category = 'LW';
        else if (['lRB', 'lCB', 'lLB'].includes(play.position)) category = 'Long';
        else if (['mRB', 'mCB', 'mLB'].includes(play.position)) category = 'Middle';
        
        if (category) {
            ps[category].t++;
            if (play.result === '1') ps[category].s++;
        }
    });
    
    const table = document.getElementById('midgameStatsTable');
    table.innerHTML = `
        <tr>
            <th>背番号</th>
            <th>RW</th>
            <th>Long</th>
            <th>Middle</th>
            <th>LW</th>
        </tr>
    `;
    
    Object.keys(playerStats).sort((a, b) => {
        if (a === '不明') return 1;
        if (b === '不明') return -1;
        return a - b;
    }).forEach(num => {
        const ps = playerStats[num];
        const row = document.createElement('tr');
        
        let html = `<td class="label-col">${num}</td>`;
        
        ['RW', 'Long', 'Middle', 'LW'].forEach(cat => {
            if (ps[cat].t > 0) {
                const rate = (ps[cat].s / ps[cat].t).toFixed(2);
                html += `<td>${ps[cat].s}/${ps[cat].t} (${rate})</td>`;
            } else {
                html += `<td>-</td>`;
            }
        });
        
        row.innerHTML = html;
        table.appendChild(row);
    });
}

// プレーヤー別統計
function updatePlayerStats() {
    const team = document.getElementById('playerTeamSelect').value;
    const teamName = team === 'A' ? teamAName : teamBName;
    
    const playerData = {};
    
    plays.filter(p => p.team === team && ['1', '0', 'TurnOver'].includes(p.result)).forEach(play => {
        const num = play.playerNumber || '不明';
        if (!playerData[num]) playerData[num] = {};
        
        const phase = getPhase(play);
        if (!playerData[num][phase]) {
            playerData[num][phase] = {};
        }
        
        const pos = play.position || '不明';
        if (!playerData[num][phase][pos]) {
            playerData[num][phase][pos] = { s: 0, t: 0 };
        }
        
        playerData[num][phase][pos].t++;
        if (play.result === '1') playerData[num][phase][pos].s++;
    });
    
    const container = document.getElementById('playerStatsContainer');
    container.innerHTML = '';
    
    const positions = ['RW', 'nRB', 'mRB', 'lRB', 'nCB', 'mCB', 'lCB', 'nLB', 'mLB', 'lLB', 'LW', 'RPV', 'CPV', 'LPV', '7m'];
    const phaseLabels = { set: 'セットオフェンス', fast1: '1次速攻', fast2: '2次速攻', '7m': '7m' };
    
    Object.keys(playerData).sort((a, b) => {
        if (a === '不明') return 1;
        if (b === '不明') return -1;
        return a - b;
    }).forEach(num => {
        const playerDiv = document.createElement('div');
        playerDiv.style.marginBottom = '30px';
        
        const title = document.createElement('h3');
        title.textContent = `【背番号 ${num}】`;
        title.style.marginBottom = '10px';
        playerDiv.appendChild(title);
        
        const table = document.createElement('table');
        table.className = 'stats-table';
        
        // ヘッダー行
        let headerHTML = '<tr><th>展開</th>';
        positions.forEach(p => headerHTML += `<th>${p}</th>`);
        headerHTML += '<th>合計</th></tr>';
        table.innerHTML = headerHTML;
        
        const phases = Object.keys(playerData[num]);
        phases.forEach(phase => {
            const row = document.createElement('tr');
            let html = `<td class="label-col">${phaseLabels[phase] || phase}</td>`;
            
            let phaseTotal = { s: 0, t: 0 };
            positions.forEach(pos => {
                const data = playerData[num][phase][pos];
                if (data && data.t > 0) {
                    const rate = (data.s / data.t).toFixed(2);
                    html += `<td>${data.s}/${data.t}<br>(${rate})</td>`;
                    phaseTotal.s += data.s;
                    phaseTotal.t += data.t;
                } else {
                    html += `<td>-</td>`;
                }
            });
            
            if (phaseTotal.t > 0) {
                const rate = (phaseTotal.s / phaseTotal.t).toFixed(2);
                html += `<td><strong>${phaseTotal.s}/${phaseTotal.t}<br>(${rate})</strong></td>`;
            } else {
                html += `<td>-</td>`;
            }
            
            row.innerHTML = html;
            table.appendChild(row);
        });
        
        // 全体行
        const totalRow = document.createElement('tr');
        totalRow.style.fontWeight = 'bold';
        totalRow.style.background = '#f0f0f0';
        let totalHTML = '<td class="label-col">全体</td>';
        let totalAll = { s: 0, t: 0 };
        
        positions.forEach(pos => {
            let posTotal = { s: 0, t: 0 };
            phases.forEach(phase => {
                const data = playerData[num][phase][pos];
                if (data) {
                    posTotal.s += data.s;
                    posTotal.t += data.t;
                }
            });
            
            if (posTotal.t > 0) {
                const rate = (posTotal.s / posTotal.t).toFixed(2);
                totalHTML += `<td>${posTotal.s}/${posTotal.t}<br>(${rate})</td>`;
                totalAll.s += posTotal.s;
                totalAll.t += posTotal.t;
            } else {
                totalHTML += `<td>-</td>`;
            }
        });
        
        if (totalAll.t > 0) {
            const rate = (totalAll.s / totalAll.t).toFixed(2);
            totalHTML += `<td><strong>${totalAll.s}/${totalAll.t}<br>(${rate})</strong></td>`;
        } else {
            totalHTML += `<td>-</td>`;
        }
        
        totalRow.innerHTML = totalHTML;
        table.appendChild(totalRow);
        
        playerDiv.appendChild(table);
        container.appendChild(playerDiv);
    });
}

// シュートコース分析（表形式・画像のレイアウトに準拠）
function updateShotCourseStats() {
    const team = document.getElementById('shotTeamSelect').value;
    const player = document.getElementById('shotPlayerSelect').value;
    const position = document.getElementById('shotPositionSelect').value;
    const phase = document.getElementById('shotPhaseSelect').value;
    
    // チーム名取得
    let teamName = '';
    if (team === 'all') {
        teamName = '全体';
    } else {
        teamName = team === 'A' ? teamAName : teamBName;
    }
    
    // データフィルタリング
    let filteredPlays = plays.filter(p => 
        p.shotCourse && 
        ['1', '0'].includes(p.result)
    );
    
    if (team !== 'all') {
        filteredPlays = filteredPlays.filter(p => p.team === team);
    }
    
    if (player !== 'all') {
        filteredPlays = filteredPlays.filter(p => (p.playerNumber || '不明') === player);
    }
    
    if (position !== 'all') {
        filteredPlays = filteredPlays.filter(p => p.position === position);
    }
    
    if (phase !== 'all') {
        filteredPlays = filteredPlays.filter(p => getPhase(p) === phase);
    }
    
    // コース別統計を計算
    const courseStats = {};
    filteredPlays.forEach(play => {
        if (!courseStats[play.shotCourse]) {
            courseStats[play.shotCourse] = { s: 0, t: 0 };
        }
        courseStats[play.shotCourse].t++;
        if (play.result === '1') courseStats[play.shotCourse].s++;
    });
    
    // データを取得する関数
    function getCourseData(course) {
        if (courseStats[course] && courseStats[course].t > 0) {
            const rate = (courseStats[course].s / courseStats[course].t).toFixed(2);
            return `${courseStats[course].s}/${courseStats[course].t}<br>(${rate})`;
        }
        return '-';
    }
    
    // 合計計算
    let totalSuccess = 0;
    let totalAttempts = 0;
    Object.values(courseStats).forEach(cs => {
        totalSuccess += cs.s;
        totalAttempts += cs.t;
    });
    
    const container = document.getElementById('shotCourseAnalysis');
    
    // ヘッダー情報
    let headerText = `${teamName}`;
    if (player !== 'all') headerText += ` / 背番号: ${player}`;
    if (position !== 'all') headerText += ` / 位置: ${position}`;
    if (phase !== 'all') {
        const phaseLabels = {
            'set': 'セットオフェンス',
            'fast1': '1次速攻',
            'fast2': '2次速攻',
            '7m': '7m'
        };
        headerText += ` / 展開: ${phaseLabels[phase]}`;
    }
    
    container.innerHTML = `
        <div class="shot-analysis-header">
            <h3>シュートコース分析</h3>
            <p>${headerText}</p>
        </div>
        
        <table class="shot-course-table">
            <tr>
                <td class="data-cell">${getCourseData('左上枠外')}</td>
                <td class="empty-cell"></td>
                <td class="data-cell">${getCourseData('上枠外')}</td>
                <td class="empty-cell"></td>
                <td class="data-cell">${getCourseData('右上枠外')}</td>
            </tr>
            <tr>
                <td class="empty-cell"></td>
                <td class="data-cell">${getCourseData('左上')}</td>
                <td class="data-cell">${getCourseData('中上')}</td>
                <td class="data-cell">${getCourseData('右上')}</td>
                <td class="empty-cell"></td>
            </tr>
            <tr>
                <td class="data-cell">${getCourseData('左枠外')}</td>
                <td class="data-cell">${getCourseData('左中')}</td>
                <td class="data-cell">${getCourseData('中中')}</td>
                <td class="data-cell">${getCourseData('右中')}</td>
                <td class="data-cell">${getCourseData('右枠外')}</td>
            </tr>
            <tr>
                <td class="empty-cell"></td>
                <td class="data-cell">${getCourseData('左下')}</td>
                <td class="data-cell">${getCourseData('中下')}</td>
                <td class="data-cell">${getCourseData('右下')}</td>
                <td class="empty-cell"></td>
            </tr>
        </table>
        
        ${totalAttempts > 0 ? `
            <div class="shot-total">
                合計: ${totalSuccess}/${totalAttempts} (${(totalSuccess / totalAttempts).toFixed(2)})
            </div>
        ` : '<div class="shot-total">データなし</div>'}
    `;
    
    // 背番号選択肢を更新（チーム選択時）
    updatePlayerSelectOptions();
}

// プレーヤー選択肢を更新
function updatePlayerSelectOptions() {
    const team = document.getElementById('shotTeamSelect').value;
    const select = document.getElementById('shotPlayerSelect');
    const currentValue = select.value;
    
    select.innerHTML = '<option value="all">全体</option>';
    
    // チームが「全体」の場合は全プレーヤー、特定チームの場合はそのチームのプレーヤーのみ
    const playerSet = new Set();
    plays.forEach(play => {
        if (team === 'all' || play.team === team) {
            if (play.playerNumber) {
                playerSet.add(play.playerNumber);
            }
        }
    });
    
    Array.from(playerSet).sort((a, b) => {
        const numA = parseInt(a);
        const numB = parseInt(b);
        if (isNaN(numA)) return 1;
        if (isNaN(numB)) return -1;
        return numA - numB;
    }).forEach(num => {
        const opt = document.createElement('option');
        opt.value = num;
        opt.textContent = `背番号 ${num}`;
        select.appendChild(opt);
    });
    
    // 以前の選択を維持
    if (currentValue && Array.from(select.options).some(opt => opt.value === currentValue)) {
        select.value = currentValue;
    }
}

// データエクスポート機能
function exportData() {
    const gameName = document.getElementById('gameName').value || '試合データ';
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const timeStr = now.toTimeString().slice(0, 5).replace(/:/g, '');
    
    // JSONデータ作成（teamはA/Bで保存）
    const exportData = {
        version: '1.0',
        exportDate: now.toISOString(),
        gameName: gameName,
        teamAName: teamAName,
        teamBName: teamBName,
        plays: plays
    };
    
    // JSON文字列に変換
    const jsonStr = JSON.stringify(exportData, null, 2);
    
    // Blobオブジェクトを作成
    const blob = new Blob([jsonStr], { type: 'application/json' });
    
    // ダウンロードリンクを作成
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `handball_${gameName}_${dateStr}_${timeStr}.json`;
    
    // ダウンロード実行
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    alert('データを保存しました！');
}

// データインポート機能（追加モード対応）
function importData(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            
            // バージョンチェック
            if (!data.version) {
                alert('無効なファイル形式です。');
                return;
            }
            
            // 既存データがある場合は追加モードを確認
            if (plays.length > 0) {
                const addMode = confirm(
                    '既存のデータがあります。\n\n' +
                    '【OK】= データを追加（既存データ + 新規データ）\n' +
                    '【キャンセル】= データを置き換え（既存データを削除）\n\n' +
                    `現在のプレー数: ${plays.length}\n` +
                    `読み込むプレー数: ${data.plays ? data.plays.length : 0}`
                );
                
                if (addMode) {
                    // 追加モード：データを追加
                    addImportedData(data);
                } else {
                    // 置き換えモード：データを置き換え
                    replaceImportedData(data);
                }
            } else {
                // 既存データがない場合は置き換え
                replaceImportedData(data);
            }
            
            // 画面を更新
            updateScoresheet();
            updateStats();
            
            // ファイル入力をリセット
            event.target.value = '';
            
        } catch (error) {
            alert('ファイルの読み込みに失敗しました。\n' + error.message);
            console.error('Import error:', error);
        }
    };
    
    reader.onerror = function() {
        alert('ファイルの読み込みエラーが発生しました。');
    };
    
    reader.readAsText(file);
}

// データ追加関数
function addImportedData(data) {
    const importedPlays = data.plays || [];
    
    // 現在のHTMLに設定されているチーム名を取得
    const currentTeamAName = document.getElementById('teamAName').value || teamAName;
    const currentTeamBName = document.getElementById('teamBName').value || teamBName;
    
    // インポートデータのチーム名を取得
    const importTeamAName = data.teamAName || 'Aチーム';
    const importTeamBName = data.teamBName || 'Bチーム';
    
    // チーム名のマッピング確認
    let teamMapping = { A: 'A', B: 'B' };
    
    // チーム名が異なる場合、マッピングを確認
    if (importTeamAName !== currentTeamAName || importTeamBName !== currentTeamBName) {
        const mappingChoice = confirm(
            '読み込むデータのチーム名が現在の設定と異なります。\n\n' +
            `【現在の設定】\nAチーム: ${currentTeamAName}\nBチーム: ${currentTeamBName}\n\n` +
            `【読み込むデータ】\nAチーム: ${importTeamAName}\nBチーム: ${importTeamBName}\n\n` +
            '【OK】= 現在の設定に合わせて追加（推奨）\n' +
            '【キャンセル】= そのまま追加'
        );
        
        if (!mappingChoice) {
            // そのまま追加（チーム名マッピングなし）
            teamMapping = { A: 'A', B: 'B' };
        }
    }
    
    // データを追加（チーム識別子はA/Bのまま）
    importedPlays.forEach(play => {
        const newPlay = {
            ...play,
            team: teamMapping[play.team] || play.team
        };
        plays.push(newPlay);
    });
    
    // 時間順に並べ替え
    sortPlaysByTime();
    
    alert(
        `データを追加しました！\n\n` +
        `追加したプレー数: ${importedPlays.length}\n` +
        `合計プレー数: ${plays.length}\n\n` +
        `※時間順に並べ替えました`
    );
}

// プレーを時間順に並べ替える関数
function sortPlaysByTime() {
    plays.sort((a, b) => {
        // 前半・後半の優先順位（前半=0、後半=1）
        const halfPriority = { '前半': 0, '後半': 1 };
        const halfA = halfPriority[a.half] || 0;
        const halfB = halfPriority[b.half] || 0;
        
        // まず前半/後半で比較
        if (halfA !== halfB) {
            return halfA - halfB;
        }
        
        // 同じ半なら時間で比較
        if (a.time !== b.time) {
            return a.time - b.time;
        }
        
        // 時間も同じならタイムスタンプで比較（元の順序を保持）
        return (a.timestamp || 0) - (b.timestamp || 0);
    });
}

// データ置き換え関数
function replaceImportedData(data) {
    // 現在のHTMLに設定されているチーム名を使用
    const currentTeamAName = document.getElementById('teamAName').value;
    const currentTeamBName = document.getElementById('teamBName').value;
    
    // チーム名が入力されている場合はそれを使用、なければインポートデータから
    if (currentTeamAName && currentTeamBName) {
        // 現在の設定を維持
        teamAName = currentTeamAName;
        teamBName = currentTeamBName;
    } else {
        // インポートデータのチーム名を使用
        teamAName = data.teamAName || 'Aチーム';
        teamBName = data.teamBName || 'Bチーム';
        
        // チーム名をUIに反映
        document.getElementById('teamAName').value = teamAName;
        document.getElementById('teamBName').value = teamBName;
    }
    
    // プレーデータを置き換え
    plays = data.plays || [];
    
    // 試合名を復元
    if (data.gameName) {
        document.getElementById('gameName').value = data.gameName;
    }
    
    // チーム名表示を更新
    updateTeamNames();
    
    alert(
        `データを読み込みました！\n\n` +
        `試合: ${data.gameName || '無名'}\n` +
        `Aチーム: ${teamAName}\n` +
        `Bチーム: ${teamBName}\n` +
        `プレー数: ${plays.length}`
    );
}

// 初期化
window.onload = function() {
    updateTeamNames();
    selectTeam('A');
    updateTimerDisplay();
};