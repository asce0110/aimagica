#!/usr/bin/env node

/**
 * 构建时间监控脚本
 * 用于跟踪和分析构建过程的时间消耗
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class BuildMonitor {
    constructor() {
        this.startTime = Date.now();
        this.phases = [];
        this.logFile = 'build-monitor.log';
    }

    log(phase, message) {
        const now = Date.now();
        const elapsed = ((now - this.startTime) / 1000).toFixed(1);
        const logEntry = `[${elapsed}s] ${phase}: ${message}`;
        
        console.log(`⏱️  ${logEntry}`);
        
        // 写入日志文件
        fs.appendFileSync(this.logFile, logEntry + '\n');
        
        this.phases.push({
            phase,
            message,
            timestamp: now,
            elapsed: parseFloat(elapsed)
        });
    }

    startPhase(phaseName) {
        this.log(phaseName, 'Started');
        return () => this.endPhase(phaseName);
    }

    endPhase(phaseName) {
        this.log(phaseName, 'Completed');
    }

    checkDiskSpace() {
        try {
            const result = execSync('df -h .', { encoding: 'utf8' });
            this.log('DISK', `Space available: ${result.split('\n')[1]}`);
        } catch (error) {
            this.log('DISK', 'Unable to check disk space');
        }
    }

    checkMemory() {
        try {
            const used = process.memoryUsage();
            const usage = Math.round(used.rss / 1024 / 1024);
            this.log('MEMORY', `Usage: ${usage}MB`);
        } catch (error) {
            this.log('MEMORY', 'Unable to check memory');
        }
    }

    generateReport() {
        const totalTime = ((Date.now() - this.startTime) / 1000).toFixed(1);
        
        console.log('\n📊 构建时间报告');
        console.log('═'.repeat(50));
        console.log(`总构建时间: ${totalTime}秒`);
        console.log('\n阶段分解:');
        
        this.phases.forEach(phase => {
            console.log(`  ${phase.elapsed}s - ${phase.phase}: ${phase.message}`);
        });

        // 性能建议
        console.log('\n💡 性能建议:');
        if (parseFloat(totalTime) > 600) { // 10分钟
            console.log('  🐌 构建时间过长，建议使用 pnpm build:turbo');
        } else if (parseFloat(totalTime) > 300) { // 5分钟
            console.log('  ⚠️  构建时间较长，可以尝试保留缓存构建');
        } else {
            console.log('  ✅ 构建时间正常');
        }
        
        console.log('═'.repeat(50));
    }

    monitorBuild(buildCommand) {
        console.log(`🚀 开始监控构建: ${buildCommand}`);
        
        // 初始检查
        this.checkDiskSpace();
        this.checkMemory();
        
        // 记录构建开始
        this.log('BUILD', `Command: ${buildCommand}`);
        
        try {
            // 执行构建命令
            execSync(buildCommand, { 
                stdio: 'inherit',
                encoding: 'utf8'
            });
            
            this.log('BUILD', 'Successfully completed');
            
        } catch (error) {
            this.log('BUILD', `Failed: ${error.message}`);
            throw error;
        } finally {
            this.generateReport();
        }
    }
}

// 命令行使用
if (require.main === module) {
    const monitor = new BuildMonitor();
    const command = process.argv[2] || 'pnpm build:turbo';
    
    monitor.monitorBuild(command);
}

module.exports = BuildMonitor; 