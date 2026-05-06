### Tipo
AFK (Away From Keyboard)

### Qué construir

Sistema de agentes con clase base abstracta e implementación concreta para sandbox Docker.

**agents/base.py:**
```python
class AgentProvider(ABC):
    """Contrato que cualquier agente debe implementar."""
    
    @abstractmethod
    def build_command(self, input_path: str, output_path: str) -> str:
        """Comando a ejecutar dentro del sandbox."""
        ...
    
    @abstractmethod
    def parse_output(self, output_path: str) -> AgentResult:
        """Parsear el output.json en un resultado estructurado."""
        ...
    
    @abstractmethod
    def validate_result(self, result: AgentResult) -> tuple[bool, str]:
        """Validar si el resultado es aceptable. (ok, feedback)"""
        ...
```

**Tipos compartidos:**
- `AgentInput`: modelo Pydantic con issue (number, title, body, criteria), context (language, framework, test_framework, standards_path), instructions (branch, skill_content, max_retries), environment (work_dir, python_version)
- `AgentResult`: modelo Pydantic con commits (lista de SHAs), tests_passed, tests_failed, coverage, summary, success (bool), error_message (opcional)

**agents/sandbox_agent.py:**
- `SandboxAgent(AgentProvider)`: Implementación para ejecutar agentes dentro de Docker
- `prepare_input(input_data, sandbox_id)` → escribe `/workspace/input.json` en el contenedor
- `build_command()` → devuelve comando para ejecutar el script del agente
- `retrieve_output(sandbox_id)` → lee `/workspace/output.json` del contenedor
- `parse_output()` → parsea output.json a AgentResult

**Contrato input/output:**
- input.json montado en `/workspace/input.json`
- output.json escrito por el agente en `/workspace/output.json`
- El script del agente dentro del sandbox es `python /workspace/gridwork_agent.py`

### Criterios de aceptación

- [ ] `AgentProvider` es abstracta y no se puede instanciar directamente
- [ ] `SandboxAgent` implementa correctamente build_command, parse_output, validate_result
- [ ] Se puede serializar/deserializar AgentInput y AgentResult a/desde JSON
- [ ] Tests: crear input.json de prueba, ejecutar agente simulado, leer output.json

### Bloqueado por

- `05-sandbox-manager.md`

### Historias de usuario

3
