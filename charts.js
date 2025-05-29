// 目次に新規セクションを追加
document.addEventListener('DOMContentLoaded', function() {
    const tocList = document.getElementById('tocList');
    if (tocList) {
        // 新しい項目を作成
        const priceGraphItem = document.createElement('li');
        priceGraphItem.className = 'toc-item';
        priceGraphItem.setAttribute('data-target', 'pricing-graph');
        priceGraphItem.textContent = '配送料金グラフシミュレーション';
        
        const incomeGraphItem = document.createElement('li');
        incomeGraphItem.className = 'toc-item';
        incomeGraphItem.setAttribute('data-target', 'driver-income-graph');
        incomeGraphItem.textContent = 'ドライバー収入グラフシミュレーション';
        
        // 既存の「競合分析」の前に挿入
        const competitiveAnalysisItem = Array.from(tocList.children).find(item => 
            item.getAttribute('data-target') === 'competitive-analysis'
        );
        
        if (competitiveAnalysisItem) {
            tocList.insertBefore(incomeGraphItem, competitiveAnalysisItem);
            tocList.insertBefore(priceGraphItem, incomeGraphItem);
        } else {
            // 見つからない場合は最後に追加
            tocList.appendChild(priceGraphItem);
            tocList.appendChild(incomeGraphItem);
        }
        
        // イベントリスナーを追加
        [priceGraphItem, incomeGraphItem].forEach(item => {
            item.addEventListener('click', function() {
                const targetId = this.getAttribute('data-target');
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    window.scrollTo({
                        top: targetElement.offsetTop - 60,
                        behavior: 'smooth'
                    });
                    
                    const tocDrawer = document.getElementById('tocDrawer');
                    if (tocDrawer) {
                        tocDrawer.classList.remove('open');
                    }
                }
            });
        });
    }

    // 配送料金のデータ（距離とコストの関係）
    const priceData = {
        // 小型パッケージ（～25ポンド）
        small: {
            // 距離（マイル）: [UPS, FedEx, USPS, HitchHaul]（米ドル）
            10: [20, 18, 22, 8],
            50: [25, 22, 28, 10],
            100: [30, 28, 35, 12],
            200: [35, 33, 40, 15],
            500: [45, 42, 50, 20],
            1000: [60, 55, 70, 30],
            2000: [80, 75, 95, 40],
            3000: [100, 90, 120, 50]
        },
        // 中型パッケージ（25～50ポンド）
        medium: {
            10: [35, 32, 40, 12],
            50: [40, 38, 45, 15],
            100: [45, 42, 50, 18],
            200: [55, 50, 60, 22],
            500: [70, 65, 80, 30],
            1000: [90, 85, 110, 45],
            2000: [120, 110, 140, 60],
            3000: [140, 130, 160, 70]
        },
        // 大型パッケージ（50～100ポンド）
        large: {
            10: [60, 55, 60, 15],
            50: [70, 65, 75, 20],
            100: [80, 75, 85, 25],
            200: [90, 85, 95, 30],
            500: [110, 100, 120, 40],
            1000: [130, 120, 150, 55],
            2000: [150, 140, 180, 65],
            3000: [170, 160, 220, 75]
        },
        // 特大パッケージ（100～150ポンド）
        xlarge: {
            10: [90, 85, 100, 25],
            50: [100, 95, 120, 30],
            100: [120, 110, 140, 40],
            200: [140, 130, 160, 50],
            500: [160, 150, 190, 65],
            1000: [180, 170, 220, 80],
            2000: [210, 200, 250, 95],
            3000: [240, 220, 280, 110]
        }
    };
    
    // ドライバー収入のデータ（距離と収入の関係）
    const incomeData = {
        // 小型パッケージ（～25ポンド）- 単位は米ドル、HitchHaulの手数料15%差引後
        small: {
            // 距離（マイル）: 収入額
            10: 6.8,
            50: 8.5,
            100: 10.2,
            200: 12.75,
            500: 17,
            1000: 25.5,
            2000: 34,
            3000: 42.5
        },
        // 中型パッケージ（25～50ポンド）
        medium: {
            10: 10.2,
            50: 12.75,
            100: 15.3,
            200: 18.7,
            500: 25.5,
            1000: 38.25,
            2000: 51,
            3000: 59.5
        },
        // 大型パッケージ（50～100ポンド）
        large: {
            10: 12.75,
            50: 17,
            100: 21.25,
            200: 25.5,
            500: 34,
            1000: 46.75,
            2000: 55.25,
            3000: 63.75
        },
        // 特大パッケージ（100～150ポンド）
        xlarge: {
            10: 21.25,
            50: 25.5,
            100: 34,
            200: 42.5,
            500: 55.25,
            1000: 68,
            2000: 80.75,
            3000: 93.5
        }
    };
    
    // 配送料金グラフの初期化
    let priceChart = null;
    let incomeChart = null;
    
    function initPriceChart() {
        const canvas = document.getElementById('price-chart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        
        const packageSize = document.getElementById('price-package-size').value;
        const carrier = document.getElementById('price-carrier').value;
        
        const distances = Object.keys(priceData[packageSize]).map(Number);
        
        // データセットの準備
        const datasets = [];
        
        if (carrier === 'all' || carrier === 'ups') {
            datasets.push({
                label: 'UPS Ground',
                data: distances.map(d => priceData[packageSize][d][0]),
                borderColor: 'rgb(165, 42, 42)',
                backgroundColor: 'rgba(165, 42, 42, 0.1)',
                tension: 0.3,
                pointRadius: 4
            });
        }
        
        if (carrier === 'all' || carrier === 'fedex') {
            datasets.push({
                label: 'FedEx Ground',
                data: distances.map(d => priceData[packageSize][d][1]),
                borderColor: 'rgb(75, 0, 130)',
                backgroundColor: 'rgba(75, 0, 130, 0.1)',
                tension: 0.3,
                pointRadius: 4
            });
        }
        
        if (carrier === 'all' || carrier === 'usps') {
            datasets.push({
                label: 'USPS Ground',
                data: distances.map(d => priceData[packageSize][d][2]),
                borderColor: 'rgb(0, 0, 255)',
                backgroundColor: 'rgba(0, 0, 255, 0.1)',
                tension: 0.3,
                pointRadius: 4
            });
        }
        
        if (carrier === 'all' || carrier === 'hitchhaul') {
            datasets.push({
                label: 'HitchHaul',
                data: distances.map(d => priceData[packageSize][d][3]),
                borderColor: 'rgb(0, 128, 0)',
                backgroundColor: 'rgba(0, 128, 0, 0.1)',
                tension: 0.3,
                pointRadius: 4,
                borderWidth: 3
            });
        }
        
        const config = {
            type: 'line',
            data: {
                labels: distances,
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: '距離別配送料金比較',
                        font: {
                            size: 18
                        },
                        padding: {
                            top: 10,
                            bottom: 20
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return context.dataset.label + ': $' + context.parsed.y;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: '距離（マイル）',
                            font: {
                                size: 14,
                                weight: 'bold'
                            }
                        },
                        ticks: {
                            callback: function(value, index) {
                                return distances[index];
                            }
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: '配送料金（$）',
                            font: {
                                size: 14,
                                weight: 'bold'
                            }
                        },
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '$' + value;
                            }
                        }
                    }
                },
                interaction: {
                    mode: 'index',
                    intersect: false
                }
            }
        };
        
        if (priceChart) {
            priceChart.destroy();
        }
        priceChart = new Chart(ctx, config);
    }
    
    function initIncomeChart() {
        const canvas = document.getElementById('income-chart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        
        const packageSize = document.getElementById('income-package-size').value;
        const packageCount = parseInt(document.getElementById('income-package-count').value);
        
        const distances = Object.keys(incomeData[packageSize]).map(Number);
        
        const timeRequired = {
            10: 0.5, 50: 0.75, 100: 1, 200: 1.25,
            500: 1.5, 1000: 2, 2000: 2.5, 3000: 3
        };
        
        const datasets = [
            {
                label: 'ドライバー収入',
                data: distances.map(d => incomeData[packageSize][d] * packageCount),
                borderColor: 'rgb(0, 85, 183)',
                backgroundColor: 'rgba(0, 85, 183, 0.1)',
                tension: 0.3,
                pointRadius: 4,
                borderWidth: 3
            },
            {
                label: '実質時給',
                data: distances.map(d => (incomeData[packageSize][d] * packageCount) / timeRequired[d]),
                borderColor: 'rgb(255, 153, 0)',
                backgroundColor: 'rgba(255, 153, 0, 0.1)',
                tension: 0.3,
                pointRadius: 4,
                borderDash: [5, 5],
                yAxisID: 'y1'
            }
        ];
        
        const config = {
            type: 'line',
            data: {
                labels: distances,
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: '距離別ドライバー収入と時給比較',
                        font: {
                            size: 18
                        },
                        padding: {
                            top: 10,
                            bottom: 20
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.dataset.label;
                                const value = context.parsed.y;
                                if (label === 'ドライバー収入') {
                                    return label + ': $' + value.toFixed(2);
                                } else {
                                    return label + ': $' + value.toFixed(2) + '/時';
                                }
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: '距離（マイル）',
                            font: {
                                size: 14,
                                weight: 'bold'
                            }
                        },
                        ticks: {
                            callback: function(value, index) {
                                return distances[index];
                            }
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: '配送収入（$）',
                            font: {
                                size: 14,
                                weight: 'bold'
                            }
                        },
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '$' + value;
                            }
                        }
                    },
                    y1: {
                        position: 'right',
                        title: {
                            display: true,
                            text: '実質時給（$/時）',
                            font: {
                                size: 14,
                                weight: 'bold'
                            }
                        },
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '$' + value + '/時';
                            }
                        },
                        grid: {
                            drawOnChartArea: false
                        }
                    }
                },
                interaction: {
                    mode: 'index',
                    intersect: false
                }
            }
        };
        
        if (incomeChart) {
            incomeChart.destroy();
        }
        incomeChart = new Chart(ctx, config);
    }
    
    // グラフの初期化と更新イベントの設定
    const pricePackageSelect = document.getElementById('price-package-size');
    const priceCarrierSelect = document.getElementById('price-carrier');
    const incomePackageSelect = document.getElementById('income-package-size');
    const incomePackageCountSelect = document.getElementById('income-package-count');
    
    if (pricePackageSelect && priceCarrierSelect) {
        pricePackageSelect.addEventListener('change', initPriceChart);
        priceCarrierSelect.addEventListener('change', initPriceChart);
        
        // ページ読み込み後少し遅延させてグラフを描画（Canvasの初期化待ち）
        setTimeout(() => {
            initPriceChart();
        }, 500);
    }
    
    if (incomePackageSelect && incomePackageCountSelect) {
        incomePackageSelect.addEventListener('change', initIncomeChart);
        incomePackageCountSelect.addEventListener('change', initIncomeChart);
        
        // ページ読み込み後少し遅延させてグラフを描画（Canvasの初期化待ち）
        setTimeout(() => {
            initIncomeChart();
        }, 500);
    }
}); 