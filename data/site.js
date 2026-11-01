window.ML_DATA = window.ML_DATA || {};
window.ML_DATA.site = {
  "name": "MamboLab",
  "name_zh": "MamboLab 人工智能研究组",
  "tagline": "演化优化 · 自动机器学习 · 智慧教育",
  "description": "MamboLab 研究智能如何被自动设计。我们以演化优化为主线，把自动机器学习、教育数据挖掘、大模型与智能体的技术接进搜索与优化的闭环 —— 从网络结构与算法配置的自动搜索，到在语义空间里直接生成更好的优化算子。",
  "affiliation": "",
  "email": "yangshang0308@gmail.com",
  "github": "https://github.com/MamboAILab",
  "hero": {
    "image": "assets/img/hero/01-earth.jpg",
    "scrim": "scrim-dark",
    "ink": "light"
  },
  "location": "",
  "join_text": "课题组常年招收硕士研究生、博士研究生与科研实习生，方向涵盖演化优化、自动机器学习、大模型驱动的算法发现与智慧教育。我们更看重好奇心与动手能力，而不是已有的成果清单。",
  "research": {
    "lead": "我们的主线只有一条：优化 —— 让算法自己变得更好。围绕它展开六条线，分别负责「搜索什么」「用什么搜」「在什么任务上验证」「从什么表示出发」。",
    "note": "六条线不是并列的：02 和 03 提供搜索的方法，04 和 05 提供真实而高价值的任务，01 和 06 提供优化的引擎与起点。同一个想法常常同时落在两三条线上——这也是我们喜欢在一起做事的原因。",
    "items": [
      {
        "id": "optim",
        "name": "演化优化与学习型优化器",
        "en": "Evolutionary Optimization & Learned Optimizers",
        "figure": "assets/img/research/evolutionary-optimization.svg",
        "desc": "把演化算法本身当作可学习的对象：用强化学习为变异、交叉与参数配置学策略，用梯度引导加速深度网络的演化训练，用代理模型把大规模搜索的评估成本压下来。",
        "tags": ["演化算法自动配置", "强化学习", "代理模型", "多目标优化"]
      },
      {
        "id": "automl",
        "name": "自动机器学习与架构搜索",
        "en": "AutoML & Neural Architecture Search",
        "figure": "assets/img/research/automl-nas.svg",
        "desc": "在给定的搜索空间里自动找结构，而不是靠人一次次试。我们做过多目标进化 NAS、多保真加速评估、鲁棒与量化网络的搜索，也把搜索推进到 Transformer 与图结构模型上。",
        "tags": ["神经架构搜索", "多目标进化", "多保真评估", "鲁棒与量化"]
      },
      {
        "id": "llm",
        "name": "大模型与智能体驱动的优化",
        "en": "LLM & Agent-Driven Optimization",
        "figure": "assets/img/research/llm-agent.svg",
        "desc": "把大模型当作搜索算子：让它读懂父代的结构、生成有针对性的候选，把随机的变异换成有语义的构造；再配合智能体的推理—反思—修正循环，在程序与算法的语义空间里做搜索。",
        "tags": ["语义空间搜索", "生成式算子", "Agent 框架", "算法发现"]
      },
      {
        "id": "cd",
        "name": "认知诊断与知识追踪",
        "en": "Cognitive Diagnosis & Knowledge Tracing",
        "figure": "assets/img/research/cognitive-diagnosis.svg",
        "desc": "从作答记录反推学生掌握了什么。我们在公平性、鲁棒性、可解释性与去偏上做过一系列工作，也把知识追踪里的上下文建模交给搜索算法自动决定。",
        "tags": ["公平性", "鲁棒性", "可解释", "知识追踪"]
      },
      {
        "id": "rec",
        "name": "习题推荐与自适应测试",
        "en": "Exercise Recommendation & Adaptive Testing",
        "figure": "assets/img/research/exercise-recommendation.svg",
        "desc": "在正确的时间给正确的题。从基于认知诊断的多目标组卷、不确定性下降的检索式选题，到序列优化驱动的学习路径推荐，我们把推荐做成一个可优化的决策过程。",
        "tags": ["多目标组卷", "自适应测试", "学习路径", "检索式推荐"]
      },
      {
        "id": "repr",
        "name": "表征学习与知识迁移",
        "en": "Representation Learning & Transfer",
        "figure": "assets/img/research/representation-learning.svg",
        "desc": "好的优化往往始于好的表示。我们用对比学习与解耦图表示分离出可迁移的因子，用知识蒸馏把大模型的能力压到可部署的规模，也把这类方法用到医疗等特征稀缺的数据上。",
        "tags": ["对比学习", "知识蒸馏", "解耦表示", "跨域迁移"]
      }
    ]
  },
  "member_groups": [
    {
      "id": "pi",
      "name": "Principal Investigator"
    },
    {
      "id": "phd",
      "name": "博士研究生"
    },
    {
      "id": "master",
      "name": "硕士研究生"
    },
    {
      "id": "intern",
      "name": "科研实习生"
    },
    {
      "id": "alumni",
      "name": "已毕业成员"
    }
  ]
}
