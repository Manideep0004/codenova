const { getCommands, IMAGES } = require('../services/executionService');

describe('Execution Service: Command Generators & Security Limits', () => {
  it('should support all 4 runtimes specified in synopsis', () => {
    expect(IMAGES['Python']).toBe('python:3.11-slim');
    expect(IMAGES['Java']).toBe('eclipse-temurin:17-jdk-alpine');
    expect(IMAGES['C++']).toBe('gcc:12');
    expect(IMAGES['JavaScript']).toBe('node:18-alpine');
  });

  it('should generate secure base64 decoded pipeline with stdin for Python', () => {
    const cmds = getCommands('Python', 'print(1)', 'custom_input');
    expect(cmds[0]).toBe('sh');
    expect(cmds[1]).toBe('-c');
    expect(cmds[2]).toContain('python3 script.py < stdin_file');
    expect(cmds[2]).toContain('base64 -d');
  });

  it('should generate C++ compilation and execution command pipeline', () => {
    const cmds = getCommands('C++', 'int main() {}', '');
    expect(cmds[2]).toContain('g++ -std=c++20 main.cpp -o main && ./main < stdin_file');
  });

  it('should generate Java compilation and execution command pipeline', () => {
    const cmds = getCommands('Java', 'public class Main {}', '');
    expect(cmds[2]).toContain('javac Main.java && java Main < stdin_file');
  });

  it('should generate JavaScript execution pipeline', () => {
    const cmds = getCommands('JavaScript', 'console.log(1)', '');
    expect(cmds[2]).toContain('node script.js < stdin_file');
  });

  it('should throw error for unsupported programming languages', () => {
    expect(() => getCommands('Rust', 'fn main() {}')).toThrow('Unsupported programming language: Rust');
  });
});
