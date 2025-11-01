import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone, MapPin, ArrowLeft, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

interface TeamMember {
  id: string;
  name: string;
  role: string;
  department: string;
  email: string;
  phone: string;
  location: string;
  avatar?: string;
  bio: string;
}

export default function TeamIntro() {
  const teamMembers: TeamMember[] = [
    {
      id: "1",
      name: "Sarah van der Berg",
      role: "Team Lead",
      department: "Operations",
      email: "sarah.vdberg@company.nl",
      phone: "+31 6 1234 5678",
      location: "Amsterdam HQ",
      bio: "Sarah leidt het operations team en is je eerste aanspreekpunt voor vragen.",
    },
    {
      id: "2",
      name: "Mark de Vries",
      role: "Senior Developer",
      department: "Engineering",
      email: "mark.devries@company.nl",
      phone: "+31 6 2345 6789",
      location: "Amsterdam HQ",
      bio: "Mark helpt je met alle technische onboarding en systeemtoegang.",
    },
    {
      id: "3",
      name: "Lisa Jansen",
      role: "HR Specialist",
      department: "Human Resources",
      email: "lisa.jansen@company.nl",
      phone: "+31 6 3456 7890",
      location: "Amsterdam HQ",
      bio: "Lisa verzorgt je administratieve onboarding en praktische zaken.",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Back button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <Link to="/preboarding">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Terug naar preboarding
            </Button>
          </Link>
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            Wie is wie in jouw team?
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Maak kennis met je directe collega's en belangrijkste contactpersonen
          </p>
        </motion.div>

        {/* Team Members Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12"
        >
          {teamMembers.map((member) => (
            <motion.div key={member.id} variants={cardVariants}>
              <Card className="group overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 h-full">
                <div className="p-6">
                  {/* Avatar and basic info */}
                  <div className="flex flex-col items-center text-center mb-6">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Avatar className="h-24 w-24 mb-4 ring-4 ring-slate-100 group-hover:ring-indigo-100 transition-all">
                        <AvatarImage src={member.avatar} alt={member.name} />
                        <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-2xl font-semibold">
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                    </motion.div>

                    <h3 className="text-xl font-semibold text-slate-900 mb-1">
                      {member.name}
                    </h3>
                    <p className="text-indigo-600 font-medium mb-2">{member.role}</p>
                    <Badge variant="secondary" className="mb-3">
                      {member.department}
                    </Badge>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {member.bio}
                    </p>
                  </div>

                  {/* Contact details */}
                  <div className="space-y-3 pt-4 border-t border-slate-100">
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
                        <Mail className="h-4 w-4 text-indigo-600" />
                      </div>
                      <a
                        href={`mailto:${member.email}`}
                        className="text-slate-600 hover:text-indigo-600 transition-colors truncate"
                      >
                        {member.email}
                      </a>
                    </div>

                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
                        <Phone className="h-4 w-4 text-green-600" />
                      </div>
                      <a
                        href={`tel:${member.phone}`}
                        className="text-slate-600 hover:text-green-600 transition-colors"
                      >
                        {member.phone}
                      </a>
                    </div>

                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0">
                        <MapPin className="h-4 w-4 text-purple-600" />
                      </div>
                      <span className="text-slate-600">{member.location}</span>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Next steps CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center"
        >
          <Card className="inline-block p-8 border-0 shadow-lg">
            <div className="flex items-center justify-center gap-3 mb-4">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <h3 className="text-xl font-semibold text-slate-900">
                Je hebt je team ontmoet!
              </h3>
            </div>
            <p className="text-slate-600 mb-6 max-w-md">
              Nu je weet wie je teamleden zijn, kun je verder met de volgende stap in je onboarding
            </p>
            <div className="flex gap-3 justify-center">
              <Link to="/preboarding">
                <Button variant="outline">Terug naar overzicht</Button>
              </Link>
              <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white">
                Volgende stap
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
