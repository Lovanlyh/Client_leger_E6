// Ce script permet de créer/réinitialiser un utilisateur test 
// avec un mot de passe connu pour faciliter les tests

const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function resetTestUser() {
  try {
    const email = 'test@test.com'
    const password = 'Password123!'
    
    console.log(`Recherche de l'utilisateur avec l'email: ${email}`)
    
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })
    
    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10)
    
    if (existingUser) {
      console.log(`Utilisateur trouvé, mise à jour du mot de passe...`)
      
      // Mettre à jour l'utilisateur existant
      const updatedUser = await prisma.user.update({
        where: { email },
        data: { password: hashedPassword }
      })
      
      console.log(`Utilisateur mis à jour:`)
      console.log(`- ID: ${updatedUser.id}`)
      console.log(`- Email: ${updatedUser.email}`)
      console.log(`- Mot de passe réinitialisé à: ${password}`)
    } else {
      console.log(`Utilisateur non trouvé, création d'un nouvel utilisateur...`)
      
      // Créer un nouvel utilisateur
      const newUser = await prisma.user.create({
        data: {
          email,
          password: hashedPassword
        }
      })
      
      console.log(`Nouvel utilisateur créé:`)
      console.log(`- ID: ${newUser.id}`)
      console.log(`- Email: ${newUser.email}`)
      console.log(`- Mot de passe: ${password}`)
    }
    
    console.log(`\nVous pouvez maintenant vous connecter avec:`)
    console.log(`Email: ${email}`)
    console.log(`Mot de passe: ${password}`)
    
  } catch (error) {
    console.error('Erreur lors de la réinitialisation de l\'utilisateur test:', error)
  } finally {
    await prisma.$disconnect()
  }
}

resetTestUser() 