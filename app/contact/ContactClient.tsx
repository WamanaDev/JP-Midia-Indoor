"use client";

import { ArrowLeft, CheckCircle2, Mail, Send } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { FormEvent, useState } from "react";

type Status = "idle" | "loading" | "success" | "error";

export function ContactClient() {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    const form = e.currentTarget;
    const formData = new FormData(form);
    const payload = {
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      message: formData.get("message"),
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || "Não foi possível enviar sua mensagem.");
        setStatus("error");
        return;
      }

      setStatus("success");
      form.reset();
    } catch {
      setErrorMessage("Não foi possível enviar sua mensagem. Tente novamente.");
      setStatus("error");
    }
  };

  return (
    <div className="bg-gray-50 text-black min-h-screen py-16 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8 md:p-12">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#3B82F6] transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para o início
        </Link>

        <div className="flex justify-center mb-8">
          <div className="bg-white p-2 rounded-lg">
            <Link href="/">
              <Image
                src="/icons/Icons/logoquadrada2.png"
                alt="JP Mídia Indoor"
                width={64}
                height={64}
              />
            </Link>
          </div>
        </div>

        <h1 className="text-3xl md:text-4xl font-bold text-[#111827] text-center mb-4">
          Fale conosco
        </h1>
        <p className="text-center text-gray-500 mb-10">
          Preencha o formulário abaixo e nossa equipe responde por e-mail o
          mais rápido possível.
        </p>

        {status === "success" ? (
          <div className="flex flex-col items-center text-center gap-3 py-10">
            <CheckCircle2 className="w-12 h-12 text-green-500" />
            <h2 className="text-xl font-semibold text-[#111827]">
              Mensagem enviada!
            </h2>
            <p className="text-gray-500 max-w-sm">
              Recebemos sua mensagem e vamos responder em breve.
            </p>
            <button
              onClick={() => setStatus("idle")}
              className="mt-2 text-[#3B82F6] font-medium hover:underline"
            >
              Enviar outra mensagem
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2">Nome</label>
              <input
                name="name"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">E-mail</label>
              <input
                type="email"
                name="email"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Telefone <span className="text-gray-400">(opcional)</span>
              </label>
              <input
                name="phone"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Mensagem
              </label>
              <textarea
                name="message"
                required
                rows={5}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent outline-none resize-none"
              />
            </div>

            {status === "error" && (
              <p className="text-sm text-red-600">{errorMessage}</p>
            )}

            <button
              type="submit"
              disabled={status === "loading"}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#3B82F6] hover:bg-blue-700 text-white rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {status === "loading" ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Enviar mensagem
                </>
              )}
            </button>

            <p className="flex items-center justify-center gap-2 text-sm text-gray-400 pt-2">
              <Mail className="w-4 h-4" />
              Ou envie direto para contato@wamanadev.com.br
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
