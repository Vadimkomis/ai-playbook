class AiPlaybook < Formula
  desc "Set up portable project instructions for coding agents"
  homepage "https://github.com/Vadimkomis/ai-playbook"
  url "https://github.com/Vadimkomis/ai-playbook/archive/7d9c433ee845971244660f45b60251a2becbaab1.tar.gz"
  version "1.3.1"
  sha256 "c2597d8af0246a9c5c0211a5e0f37e104fdcefe6a3b33527b92229b8363a9042"
  license "MIT"

  depends_on "node"

  def install
    libexec.install "bin", "src", "templates", "contracts", ".agents", "Codex", "Claude", "package.json"
    (bin/"ai-playbook").write <<~SH
      #!/bin/sh
      exec "#{formula_opt_bin("node")}/node" "#{libexec}/bin/ai-playbook.js" "$@"
    SH
  end

  test do
    project = testpath/"project with spaces"
    project.mkpath
    system bin/"ai-playbook", "--target", project, "--yes"
    expected = %w[.ai-playbook-manifest.json AGENTS.md ARCHITECTURE.md memory.md]
    assert_equal expected, project.children.map { |file| file.basename.to_s }.sort
    assert_equal version.to_s, JSON.parse((project/".ai-playbook-manifest.json").read).fetch("version")
    assert_match "TODO", shell_output("#{bin}/ai-playbook doctor --target '#{project}'", 1)

    # Completed, customized docs must survive reinstalling with every optional asset.
    %w[AGENTS.md ARCHITECTURE.md memory.md].each do |name|
      (project/name).atomic_write "# Project guidance\nPreserve our existing #{name}.\n"
    end
    system bin/"ai-playbook", "--target", project, "--yes", "--agent", "both", "--with", "all"
    assert_equal "# Project guidance\nPreserve our existing AGENTS.md.\n", (project/"AGENTS.md").read
    system bin/"ai-playbook", "doctor", "--target", project
    assert_path_exists project/".agents/skills/validate-feature-candidate/SKILL.md"
    assert_path_exists project/".codex/agents/independent-validator.toml"
    assert_path_exists project/".claude/agents/independent-validator.md"
    assert_path_exists project/".ai-playbook/contracts/independent-validator/validate.cjs"
  end
end
